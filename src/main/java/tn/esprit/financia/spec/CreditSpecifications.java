package tn.esprit.financia.spec;

import org.springframework.data.jpa.domain.Specification;
import tn.esprit.financia.entities.credit.Credit;
import tn.esprit.financia.entities.credit.StatusC;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class CreditSpecifications {

    private CreditSpecifications() {}

    public static Specification<Credit> build(
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
    ) {
        Specification<Credit> spec = (root, query, cb) -> cb.conjunction();

        if (userId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("user").get("idUser"), userId));
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
        if (minDurationMonths != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("durationMonths"), minDurationMonths));
        }
        if (maxDurationMonths != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("durationMonths"), maxDurationMonths));
        }
        if (minRiskScore != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("riskScore"), minRiskScore));
        }
        if (maxRiskScore != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("riskScore"), maxRiskScore));
        }
        if (startDateFrom != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("startDate"), startDateFrom));
        }
        if (startDateTo != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("startDate"), startDateTo));
        }

        return spec;
    }
}

