package tn.esprit.financia.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import tn.esprit.financia.entities.Credit;
import tn.esprit.financia.entities.PaymentStatus;
import tn.esprit.financia.entities.Remboursement;
import tn.esprit.financia.entities.StatusC;
import tn.esprit.financia.entities.User;
import tn.esprit.financia.repository.CreditRepository;
import tn.esprit.financia.repository.RemboursementRepository;
import tn.esprit.financia.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CreditServiceImpl implements CreditService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final RoundingMode RM = RoundingMode.HALF_UP;

    private final CreditRepository creditRepository;
    private final UserRepository userRepository;
    private final RemboursementRepository remboursementRepository;
    private final CreditScoringService creditScoringService;
    private final MlInterestRateService mlInterestRateService;

    @Value("${ml.rate-api-base-url:}")
    private String mlRateApiBaseUrl;

    @Override
    public Credit create(Credit credit, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Règle métier: un user ne peut avoir qu'un seul crédit "ouvert" à la fois.
        // (PENDING/APPROVED/ACTIVE). Il peut redemander après REJECTED ou CLOSED.
        if (creditRepository.existsByUser_IdUserAndStatusIn(
                userId,
                List.of(StatusC.PENDING, StatusC.APPROVED, StatusC.ACTIVE)
        )) {
            throw new IllegalStateException("Ce user a déjà un crédit en cours (PENDING/APPROVED/ACTIVE).");
        }

        credit.setUser(user);
        applyScoreAndDecision(credit, List.of());
        applyInterestRate(credit);
        applyPaidAndRemaining(credit, List.of());
        return creditRepository.save(credit);
    }

    @Override
    @Transactional(readOnly = true)
    public Credit getById(Long id) {
        return creditRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Credit> getAll() {
        return creditRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Credit> getByUser(Long userId) {
        return creditRepository.findByUser_IdUser(userId);
    }

    @Override
    public Credit update(Long id, Credit updated) {
        Credit existing = getById(id);

        if (updated.getAmount() != null) existing.setAmount(updated.getAmount());
        if (updated.getDurationMonths() != null) existing.setDurationMonths(updated.getDurationMonths());
        if (updated.getStartDate() != null) existing.setStartDate(updated.getStartDate());
        if (updated.getEndDate() != null) existing.setEndDate(updated.getEndDate());
        // status: on autorise uniquement les transitions métier "manuelles" (ACTIVE/CLOSED).
        if (updated.getStatus() == StatusC.ACTIVE || updated.getStatus() == StatusC.CLOSED) {
            existing.setStatus(updated.getStatus());
        }

        // user non modifiable ici (sinon incohérence)
        // Recalcul dynamique du score si le crédit est toujours en décision (APPROVED/PENDING/REJECTED).
        List<Remboursement> history = remboursementRepository.findByCredit_Id(existing.getId());
        applyScoreAndDecision(existing, history);
        applyInterestRate(existing);
        applyPaidAndRemaining(existing, history);
        return creditRepository.save(existing);
    }

    @Override
    public Credit recalculateRisk(Long creditId) {
        Credit credit = getById(creditId);
        List<Remboursement> history = remboursementRepository.findByCredit_Id(creditId);
        applyScoreAndDecision(credit, history);
        applyInterestRate(credit);
        applyPaidAndRemaining(credit, history);
        return creditRepository.save(credit);
    }

    /**
     * À appeler après un paiement (création/modification d'un remboursement) pour:
     * - recalculer riskScore + status décisionnel
     * - passer APPROVED -> ACTIVE au premier paiement effectif
     */
    @Override
    public Credit updateRiskAfterPayment(Long creditId) {
        Credit credit = getById(creditId);
        List<Remboursement> history = remboursementRepository.findByCredit_Id(creditId);

        // Si au moins un remboursement est payé, le crédit passe en ACTIVE (si applicable)
        boolean hasAnyPaid = history.stream().anyMatch(r -> r != null && r.getStatus() == PaymentStatus.PAID);
        if (hasAnyPaid && credit.getStatus() == StatusC.APPROVED) {
            credit.setStatus(StatusC.ACTIVE);
        }

        applyScoreAndDecision(credit, history);
        applyInterestRate(credit);
        applyPaidAndRemaining(credit, history);

        // Si tout est payé, on peut clôturer automatiquement (optionnel)
        if (credit.getRemainingAmount() != null
                && credit.getRemainingAmount().compareTo(ZERO) == 0
                && credit.getStatus() == StatusC.ACTIVE) {
            credit.setStatus(StatusC.CLOSED);
        }
        return creditRepository.save(credit);
    }

    @Override
    public void delete(Long id) {
        creditRepository.delete(getById(id));
    }

    private void applyScoreAndDecision(Credit credit, List<Remboursement> remboursements) {
        BigDecimal score = creditScoringService.calculateRiskScore(credit, remboursements);
        credit.setRiskScore(score);

        // Décision dynamique: tant que le crédit n'est pas dans un état de cycle de vie (ACTIVE/CLOSED),
        // on ajuste le status (APPROVED/PENDING/REJECTED) selon le score.
        if (credit.getStatus() != StatusC.ACTIVE && credit.getStatus() != StatusC.CLOSED) {
            credit.setStatus(creditScoringService.decideStatus(score));
        }
    }

    private void applyInterestRate(Credit credit) {
        // Le taux est calculé automatiquement; on ne laisse pas le front le fournir.
        // On fige le taux si le crédit est en cycle de vie (ACTIVE/CLOSED).
        if (credit.getStatus() == StatusC.ACTIVE || credit.getStatus() == StatusC.CLOSED) return;
        credit.setInterestRate(mlInterestRateService.predictAnnualRatePercent(credit, mlRateApiBaseUrl));
    }

    private void applyPaidAndRemaining(Credit credit, List<Remboursement> history) {
        BigDecimal principal = credit.getAmount() == null ? ZERO : credit.getAmount();

        // Total à payer = principal + intérêt simple sur la durée (taux annuel %).
        // interest = principal * (annualRate/100) * (durationMonths/12)
        BigDecimal annualRatePercent = credit.getInterestRate() == null ? ZERO : credit.getInterestRate();
        BigDecimal durationMonths = credit.getDurationMonths() == null ? ZERO : BigDecimal.valueOf(credit.getDurationMonths());

        BigDecimal rateDecimal = annualRatePercent
                .divide(new BigDecimal("100"), 10, RM);
        BigDecimal durationYears = durationMonths
                .divide(new BigDecimal("12"), 10, RM);

        BigDecimal interest = principal
                .multiply(rateDecimal)
                .multiply(durationYears);

        BigDecimal totalPayable = principal.add(interest);

        BigDecimal paid = (history == null ? List.<Remboursement>of() : history).stream()
                // On considère "payé" si status=PAID ou si paymentDate est renseigné (donnée historique).
                .filter(r -> r != null && (r.getStatus() == PaymentStatus.PAID || r.getPaymentDate() != null))
                .map(Remboursement::getAmount)
                .filter(a -> a != null)
                .reduce(ZERO, BigDecimal::add);

        // Clamp paid to [0, totalPayable]
        if (paid.compareTo(ZERO) < 0) paid = ZERO;
        if (paid.compareTo(totalPayable) > 0) paid = totalPayable;

        BigDecimal remaining = totalPayable.subtract(paid);
        if (remaining.compareTo(ZERO) < 0) remaining = ZERO;

        credit.setPaidAmount(paid.setScale(3, RM));
        credit.setRemainingAmount(remaining.setScale(3, RM));
    }
}
