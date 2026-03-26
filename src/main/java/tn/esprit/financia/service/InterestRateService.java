package tn.esprit.financia.service;

import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.Credit;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calcule un taux d'intérêt ANNUEL (en %) automatiquement.
 * Le taux dépend du montant, de la durée et du score de risque.
 */
@Service
public class InterestRateService {

    private static final RoundingMode RM = RoundingMode.HALF_UP;
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    // Bornes (annuelles, en %)
    private static final BigDecimal MIN_RATE = new BigDecimal("8.00");
    private static final BigDecimal MAX_RATE = new BigDecimal("30.00");

    // Taux de base annuel (en %)
    private static final BigDecimal BASE_RATE = new BigDecimal("12.00");

    public BigDecimal calculateAnnualRatePercent(Credit credit) {
        if (credit == null) return BASE_RATE;

        BigDecimal amount = credit.getAmount();
        Integer durationMonths = credit.getDurationMonths();
        BigDecimal riskScore = credit.getRiskScore();

        BigDecimal rate = BASE_RATE
                .add(durationMargin(durationMonths))
                .add(amountMargin(amount))
                .add(riskMargin(riskScore));

        return clamp(rate, MIN_RATE, MAX_RATE).setScale(2, RM);
    }

    private BigDecimal durationMargin(Integer months) {
        if (months == null || months <= 0) return new BigDecimal("2.50"); // pénalité si durée invalide
        if (months <= 6) return new BigDecimal("0.00");
        if (months <= 12) return new BigDecimal("0.75");
        if (months <= 24) return new BigDecimal("1.50");
        return new BigDecimal("2.50");
    }

    private BigDecimal amountMargin(BigDecimal amount) {
        if (amount == null || amount.compareTo(ZERO) <= 0) return new BigDecimal("2.00");
        if (amount.compareTo(new BigDecimal("1000")) < 0) return new BigDecimal("3.00");
        if (amount.compareTo(new BigDecimal("5000")) < 0) return new BigDecimal("2.00");
        if (amount.compareTo(new BigDecimal("10000")) < 0) return new BigDecimal("1.00");
        return new BigDecimal("0.50");
    }

    private BigDecimal riskMargin(BigDecimal score) {
        // score 0..100 (plus haut = meilleur) => marge plus faible
        if (score == null) return new BigDecimal("2.00");
        if (score.compareTo(new BigDecimal("85")) >= 0) return new BigDecimal("-1.00");
        if (score.compareTo(new BigDecimal("75")) >= 0) return new BigDecimal("0.00");
        if (score.compareTo(new BigDecimal("55")) >= 0) return new BigDecimal("2.00");
        return new BigDecimal("4.00");
    }

    private static BigDecimal clamp(BigDecimal v, BigDecimal min, BigDecimal max) {
        if (v.compareTo(min) < 0) return min;
        if (v.compareTo(max) > 0) return max;
        return v;
    }
}

