package tn.esprit.financia.spec;

import org.springframework.data.jpa.domain.Specification;
import tn.esprit.financia.entities.credit.PaymentStatus;
import tn.esprit.financia.entities.credit.Remboursement;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class RemboursementSpecifications {

    private RemboursementSpecifications() {}

    public static Specification<Remboursement> build(
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
        LocalDate today = LocalDate.now();
        Specification<Remboursement> spec = (root, query, cb) -> cb.conjunction();

        if (creditId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("credit").get("id"), creditId));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (minAmount != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("amount"), minAmount));
        }
        if (maxAmount != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("amount"), maxAmount));
        }
        if (dueFrom != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("dueDate"), dueFrom));
        }
        if (dueTo != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("dueDate"), dueTo));
        }
        if (paidFrom != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("paymentDate"), paidFrom));
        }
        if (paidTo != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("paymentDate"), paidTo));
        }
        if (minLateDays != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("lateDays"), minLateDays));
        }
        if (maxLateDays != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("lateDays"), maxLateDays));
        }
        if (Boolean.TRUE.equals(overdue)) {
            spec = spec.and((root, query, cb) -> cb.and(
                    cb.equal(root.get("status"), PaymentStatus.PENDING),
                    cb.isNull(root.get("paymentDate")),
                    cb.isNotNull(root.get("dueDate")),
                    cb.lessThan(root.get("dueDate"), today)
            ));
        }

        return spec;
    }
}

