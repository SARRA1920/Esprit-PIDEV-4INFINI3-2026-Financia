package tn.esprit.financia.service.credit;

import tn.esprit.financia.entities.credit.Credit;
import tn.esprit.financia.entities.credit.StatusC;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CreditService {
    Credit create(Credit credit, Long userId);

    Credit getById(Long id);

    List<Credit> getAll();

    List<Credit> getByUser(Long userId);

    /**
     * Crédit en cours empêchant une nouvelle demande (ex. PENDING / OFFER_PENDING / APPROVED / ACTIVE).
     */
    Optional<Credit> findBlockingCreditForUser(Long userId);

    List<Credit> search(
            Long userId,
            StatusC status,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            Integer minDurationMonths,
            Integer maxDurationMonths,
            BigDecimal minRiskScore,
            BigDecimal maxRiskScore,
            LocalDate startDateFrom,
            LocalDate startDateTo
    );

    Credit update(Long id, Credit credit);

    Credit recalculateRisk(Long creditId);

    Credit updateRiskAfterPayment(Long creditId);

    void delete(Long id);

    /**
     * Crée les lignes d’échéances si le crédit est éligible et qu’aucune n’existe encore.
     * À appeler depuis la lecture des remboursements pour “réparer” les dossiers anciens.
     */
    void ensureInstallmentsForCredit(Long creditId);

    Credit acceptOffer(Long creditId, Long userId);

    Credit refuseOffer(Long creditId, Long userId);
}

