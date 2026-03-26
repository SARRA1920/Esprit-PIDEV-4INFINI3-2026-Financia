package tn.esprit.financia.service;

import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.Credit;
import tn.esprit.financia.entities.Remboursement;
import tn.esprit.financia.entities.StatusC;
import tn.esprit.financia.entities.User;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class CreditScoringService {

    private static final RoundingMode RM = RoundingMode.HALF_UP;
    private static final int CALC_SCALE = 10;

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    /**
     * Calcule la mensualité = amount / durationMonths.
     */
    public BigDecimal calculateMonthlyPayment(BigDecimal amount, Integer durationMonths) {
        if (amount == null || durationMonths == null || durationMonths <= 0) return ZERO;
        return amount.divide(BigDecimal.valueOf(durationMonths), CALC_SCALE, RM);
    }

    /**
     * Calcule le DTI = mensualité / monthlyIncome.
     */
    public BigDecimal calculateDti(BigDecimal monthlyPayment, BigDecimal monthlyIncome) {
        if (monthlyPayment == null) return ZERO;
        if (monthlyIncome == null || monthlyIncome.compareTo(ZERO) <= 0) return BigDecimal.ONE; // DTI max si revenu inconnu
        return monthlyPayment.divide(monthlyIncome, CALC_SCALE, RM);
    }

    /**
     * Score 0..100 (BigDecimal) basé sur:
     * - revenu mensuel
     * - DTI
     * - historique retards (lateDays)
     * - ancienneté client (yearsAsClient)
     */
    public BigDecimal calculateRiskScore(Credit credit, List<Remboursement> remboursements) {
        if (credit == null) return ZERO;
        User user = credit.getUser();

        BigDecimal monthlyIncome = (user == null) ? null : user.getMonthlyIncome();
        Integer yearsAsClient = (user == null) ? null : user.getYearsAsClient();

        BigDecimal monthlyPayment = calculateMonthlyPayment(credit.getAmount(), credit.getDurationMonths());
        BigDecimal dti = calculateDti(monthlyPayment, monthlyIncome);

        int incomePoints = scoreIncome(monthlyIncome);          // 0..25
        int dtiPoints = scoreDti(dti);                          // 0..35
        int latePoints = scoreLateHistory(remboursements);      // 0..25
        int seniorityPoints = scoreSeniority(yearsAsClient);    // 0..15

        int total = incomePoints + dtiPoints + latePoints + seniorityPoints;
        total = Math.max(0, Math.min(100, total));

        return BigDecimal.valueOf(total).setScale(2, RM);
    }

    public StatusC decideStatus(BigDecimal score) {
        if (score == null) return StatusC.PENDING;
        if (score.compareTo(BigDecimal.valueOf(75)) >= 0) return StatusC.APPROVED;
        if (score.compareTo(BigDecimal.valueOf(55)) >= 0) return StatusC.PENDING;
        return StatusC.REJECTED;
    }

    private int scoreIncome(BigDecimal monthlyIncome) {
        if (monthlyIncome == null || monthlyIncome.compareTo(ZERO) <= 0) return 0;
        if (monthlyIncome.compareTo(BigDecimal.valueOf(500)) < 0) return 5;
        if (monthlyIncome.compareTo(BigDecimal.valueOf(1000)) < 0) return 10;
        if (monthlyIncome.compareTo(BigDecimal.valueOf(2000)) < 0) return 15;
        if (monthlyIncome.compareTo(BigDecimal.valueOf(3000)) < 0) return 20;
        return 25;
    }

    private int scoreDti(BigDecimal dti) {
        if (dti == null) return 0;
        if (dti.compareTo(new BigDecimal("0.20")) <= 0) return 35;
        if (dti.compareTo(new BigDecimal("0.30")) <= 0) return 30;
        if (dti.compareTo(new BigDecimal("0.40")) <= 0) return 22;
        if (dti.compareTo(new BigDecimal("0.50")) <= 0) return 15;
        if (dti.compareTo(new BigDecimal("0.60")) <= 0) return 8;
        return 0;
    }

    private int scoreLateHistory(List<Remboursement> remboursements) {
        if (remboursements == null || remboursements.isEmpty()) return 15; // neutre si pas d'historique

        int count = 0;
        int sumLate = 0;
        for (Remboursement r : remboursements) {
            if (r == null) continue;
            Integer late = effectiveLateDays(r);
            if (late == null) continue;
            count++;
            sumLate += Math.max(0, late);
        }
        if (count == 0) return 15;

        BigDecimal avg = BigDecimal.valueOf(sumLate)
                .divide(BigDecimal.valueOf(count), CALC_SCALE, RM);

        if (avg.compareTo(ZERO) == 0) return 25;
        if (avg.compareTo(BigDecimal.valueOf(3)) <= 0) return 20;
        if (avg.compareTo(BigDecimal.valueOf(7)) <= 0) return 12;
        if (avg.compareTo(BigDecimal.valueOf(15)) <= 0) return 6;
        return 0;
    }

    private Integer effectiveLateDays(Remboursement r) {
        if (r.getLateDays() != null) return r.getLateDays();
        LocalDate due = r.getDueDate();
        LocalDateTime paid = r.getPaymentDate();
        if (due == null || paid == null) return 0;
        long days = ChronoUnit.DAYS.between(due, paid.toLocalDate());
        return (int) Math.max(0, days);
    }

    private int scoreSeniority(Integer yearsAsClient) {
        if (yearsAsClient == null) return 5;
        if (yearsAsClient < 1) return 5;
        if (yearsAsClient < 3) return 9;
        if (yearsAsClient < 5) return 12;
        return 15;
    }
}

