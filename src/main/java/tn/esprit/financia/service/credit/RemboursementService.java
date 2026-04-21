package tn.esprit.financia.service.credit;

import tn.esprit.financia.entities.credit.PaymentStatus;
import tn.esprit.financia.entities.credit.Remboursement;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface RemboursementService {
    Remboursement create(Remboursement remboursement, Long creditId);

    Remboursement getById(Long id);

    List<Remboursement> getAll();

    List<Remboursement> getByCredit(Long creditId);

    List<Remboursement> search(
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
    );

    Remboursement update(Long id, Remboursement updated);

    Remboursement pay(Long remboursementId, LocalDateTime paymentDate);

    void delete(Long id);
}

