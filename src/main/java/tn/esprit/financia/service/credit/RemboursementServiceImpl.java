package tn.esprit.financia.service.credit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.entities.credit.Credit;
import tn.esprit.financia.entities.credit.PaymentStatus;
import tn.esprit.financia.entities.credit.Remboursement;
import tn.esprit.financia.entities.credit.StatusC;
import tn.esprit.financia.repository.credit.CreditRepository;
import tn.esprit.financia.repository.credit.RemboursementRepository;
import tn.esprit.financia.spec.RemboursementSpecifications;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RemboursementServiceImpl implements RemboursementService {

    private final RemboursementRepository remboursementRepository;
    private final CreditRepository creditRepository;
    private final CreditService creditService;
    private final SmsService smsService;

    @Override
    public Remboursement create(Remboursement remboursement, Long creditId) {
        Credit credit = creditRepository.findById(creditId)
                .orElseThrow(() -> new RuntimeException("Credit not found"));

        if (credit.getStatus() == StatusC.REJECTED) {
            throw new IllegalStateException("Impossible de rembourser un crédit REJECTED.");
        }
        if (credit.getStatus() == StatusC.PENDING) {
            throw new IllegalStateException("Impossible de rembourser un crédit PENDING (non approuvé).");
        }

        // Workflow: création d'échéance => toujours PENDING (payment via /pay).
        remboursement.setStatus(PaymentStatus.PENDING);
        remboursement.setPaymentDate(null);

        remboursement.setCredit(credit);
        Remboursement saved = remboursementRepository.save(remboursement);
        // Recalcul global (paidAmount/remainingAmount, score...) après création d'échéance.
        creditService.updateRiskAfterPayment(creditId);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Remboursement getById(Long id) {
        return remboursementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Remboursement not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Remboursement> getAll() {
        return remboursementRepository.findAll();
    }

    @Override
    @Transactional
    public List<Remboursement> getByCredit(Long creditId) {
        // Génère l’échéancier côté serveur si encore vide (PENDING/APPROVED/ACTIVE), puis retourne la liste.
        creditService.ensureInstallmentsForCredit(creditId);
        return remboursementRepository.findByCredit_Id(creditId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Remboursement> search(
            Long creditId,
            PaymentStatus status,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            LocalDate dueFrom,
            LocalDate dueTo,
            LocalDateTime paidFrom,
            LocalDateTime paidTo,
            Integer minLateDays,
            Integer maxLateDays,
            Boolean overdue
    ) {
        return remboursementRepository.findAll(RemboursementSpecifications.build(
                creditId,
                status,
                minAmount,
                maxAmount,
                dueFrom,
                dueTo,
                paidFrom,
                paidTo,
                minLateDays,
                maxLateDays,
                overdue
        ));
    }

    @Override
    public Remboursement update(Long id, Remboursement updated) {
        Remboursement existing = getById(id);
        Credit credit = existing.getCredit();

        if (credit.getStatus() == StatusC.REJECTED) {
            throw new IllegalStateException("Impossible de modifier un remboursement pour un crédit REJECTED.");
        }
        if (credit.getStatus() == StatusC.PENDING) {
            throw new IllegalStateException("Impossible de modifier un remboursement pour un crédit PENDING (non approuvé).");
        }

        if (updated.getAmount() != null) existing.setAmount(updated.getAmount());
        if (updated.getDueDate() != null) existing.setDueDate(updated.getDueDate());
        if (updated.getPaymentDate() != null) existing.setPaymentDate(updated.getPaymentDate());
        if (updated.getLateDays() != null) existing.setLateDays(updated.getLateDays());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        // credit non modifiable ici

        boolean isPaidNow = (existing.getStatus() == PaymentStatus.PAID) || (existing.getPaymentDate() != null);
        if (isPaidNow && credit.getStatus() == StatusC.APPROVED) {
            credit.setStatus(StatusC.ACTIVE);
            creditRepository.save(credit);
        }

        Remboursement saved = remboursementRepository.save(existing);
        creditService.updateRiskAfterPayment(credit.getId());
        return saved;
    }

    @Override
    public Remboursement pay(Long remboursementId, LocalDateTime paymentDate) {
        Remboursement existing = getById(remboursementId);
        Credit credit = existing.getCredit();

        if (credit.getStatus() == StatusC.REJECTED) {
            throw new IllegalStateException("Impossible de payer une échéance pour un crédit REJECTED.");
        }
        if (credit.getStatus() == StatusC.PENDING) {
            throw new IllegalStateException("Impossible de payer une échéance pour un crédit PENDING (non approuvé).");
        }
        if (existing.getStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Ce remboursement est déjà payé.");
        }

        existing.setStatus(PaymentStatus.PAID);
        existing.setPaymentDate(paymentDate != null ? paymentDate : LocalDateTime.now());

        Remboursement saved = remboursementRepository.save(existing);
        Credit updatedCredit = creditService.updateRiskAfterPayment(credit.getId());
        smsService.sendPaymentSuccess(updatedCredit.getUser(), updatedCredit, saved);
        return saved;
    }

    @Override
    public void delete(Long id) {
        Long creditId = getById(id).getCredit().getId();
        remboursementRepository.delete(getById(id));
        creditService.recalculateRisk(creditId);
    }
}

