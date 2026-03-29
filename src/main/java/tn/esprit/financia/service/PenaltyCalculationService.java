package tn.esprit.financia.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.entities.Contrat;
import tn.esprit.financia.entities.EcheancierPayement;
import tn.esprit.financia.entities.PenaltyHistory;
import tn.esprit.financia.entities.User;
import tn.esprit.financia.entities.enums.PenaltyType;
import tn.esprit.financia.entities.enums.StatusE;
import tn.esprit.financia.repository.EcheancierPayementRepository;
import tn.esprit.financia.repository.PenaltyHistoryRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PenaltyCalculationService {

    private final EcheancierPayementRepository echeancierRepository;
    private final PenaltyHistoryRepository penaltyHistoryRepository;
    private final WhatsAppService whatsAppService;

    /**
     * Calculate penalty based on days overdue
     * Formula for PERCENTAGE: penalty = amountDue * (penaltyRate/100) * (daysOverdue/30)
     * Formula for FIXED: penalty = fixedRate * daysOverdue
     */
    public BigDecimal calculatePenalty(EcheancierPayement echeancier, Contrat contrat) {
        if (echeancier.getStatus() != StatusE.OVERDUE) {
            return BigDecimal.ZERO;
        }

        // Check if contract has penalty configuration
        if (contrat.getPenaltyRate() == null || contrat.getPenaltyType() == null) {
            return BigDecimal.ZERO;
        }

        LocalDate today = LocalDate.now();
        LocalDate dueDate = echeancier.getDueDate();

        // Apply grace period
        LocalDate penaltyStartDate = dueDate.plusDays(
            contrat.getGracePeriodDays() != null ? contrat.getGracePeriodDays() : 0
        );

        if (today.isBefore(penaltyStartDate) || today.isEqual(penaltyStartDate)) {
            return BigDecimal.ZERO;
        }

        long daysOverdue = ChronoUnit.DAYS.between(penaltyStartDate, today);

        BigDecimal penalty = BigDecimal.ZERO;

        switch (contrat.getPenaltyType()) {
            case PERCENTAGE:
                // Daily penalty = (amountDue * rate%) / 30 days
                penalty = echeancier.getAmountDue()
                    .multiply(contrat.getPenaltyRate())
                    .divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)
                    .divide(BigDecimal.valueOf(30), 6, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(daysOverdue))
                    .setScale(3, RoundingMode.HALF_UP);
                break;

            case FIXED:
                // Fixed amount per day
                penalty = contrat.getPenaltyRate()
                    .multiply(BigDecimal.valueOf(daysOverdue))
                    .setScale(3, RoundingMode.HALF_UP);
                break;

            case TIERED:
                penalty = calculateTieredPenalty(echeancier, contrat, daysOverdue);
                break;
        }

        // Cap penalty at reasonable limit (e.g., 50% of amount due)
        BigDecimal maxPenalty = echeancier.getAmountDue()
            .multiply(BigDecimal.valueOf(0.5));

        return penalty.min(maxPenalty);
    }

    /**
     * Tiered penalty: higher rates for longer delays
     * 0-30 days: 2%
     * 31-60 days: 5%
     * 61+ days: 10%
     */
    private BigDecimal calculateTieredPenalty(EcheancierPayement echeancier,
                                              Contrat contrat, long daysOverdue) {
        BigDecimal penalty = BigDecimal.ZERO;
        BigDecimal amountDue = echeancier.getAmountDue();

        if (daysOverdue <= 30) {
            penalty = amountDue.multiply(BigDecimal.valueOf(0.02));
        } else if (daysOverdue <= 60) {
            penalty = amountDue.multiply(BigDecimal.valueOf(0.05));
        } else {
            penalty = amountDue.multiply(BigDecimal.valueOf(0.10));
        }

        return penalty.setScale(3, RoundingMode.HALF_UP);
    }

    /**
     * Update penalty for a single payment
     */
    @Transactional
    public void updatePenaltyForPayment(Long echeancierPayementId) {
        EcheancierPayement echeancier = echeancierRepository.findById(echeancierPayementId)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + echeancierPayementId));

        Contrat contrat = echeancier.getContrat();

        BigDecimal oldPenalty = echeancier.getPenaltyAmount() != null ? 
            echeancier.getPenaltyAmount() : BigDecimal.ZERO;
        BigDecimal newPenalty = calculatePenalty(echeancier, contrat);

        if (!oldPenalty.equals(newPenalty)) {
            echeancier.setPenaltyAmount(newPenalty);

            // Update days overdue
            LocalDate today = LocalDate.now();
            LocalDate dueDate = echeancier.getDueDate();
            long daysOverdue = ChronoUnit.DAYS.between(dueDate, today);
            echeancier.setDaysOverdue((int) Math.max(0, daysOverdue));

            echeancierRepository.save(echeancier);

            // Log penalty history
            logPenaltyHistory(echeancier, oldPenalty, newPenalty, daysOverdue);

            log.info("Updated penalty for payment {}: {} -> {}",
                echeancierPayementId, oldPenalty, newPenalty);

            // Send WhatsApp notification if penalty increased
            if (newPenalty.compareTo(oldPenalty) > 0) {
                try {
                    whatsAppService.sendPenaltyNotification(echeancier, contrat.getCredit().getUser());
                    log.info("WhatsApp notification sent for payment {}", echeancierPayementId);
                } catch (Exception e) {
                    log.error("Failed to send WhatsApp notification for payment {}: {}", 
                        echeancierPayementId, e.getMessage());
                    // Don't fail the transaction if WhatsApp fails
                }
            }
        }
    }

    /**
     * Batch update all overdue payments
     */
    @Transactional
    public int updateAllOverduePenalties() {
        List<EcheancierPayement> overduePayments = echeancierRepository
            .findByStatus(StatusE.OVERDUE);

        log.info("Updating penalties for {} overdue payments", overduePayments.size());

        int updated = 0;
        for (EcheancierPayement payment : overduePayments) {
            try {
                updatePenaltyForPayment(payment.getId());
                updated++;
            } catch (Exception e) {
                log.error("Failed to update penalty for payment {}", payment.getId(), e);
            }
        }

        log.info("Successfully updated {} penalties", updated);
        return updated;
    }

    /**
     * Check and update payment status (PENDING -> OVERDUE)
     */
    @Transactional
    public int checkAndUpdateOverdueStatus() {
        LocalDate today = LocalDate.now();
        List<EcheancierPayement> pendingPayments = echeancierRepository
            .findByStatus(StatusE.PENDING);

        int updated = 0;
        for (EcheancierPayement payment : pendingPayments) {
            if (payment.getDueDate().isBefore(today)) {
                payment.setStatus(StatusE.OVERDUE);
                payment.setOverdueDate(today);
                echeancierRepository.save(payment);

                log.info("Payment {} marked as OVERDUE", payment.getId());
                
                // Send WhatsApp notification
                try {
                    User user = payment.getContrat().getCredit().getUser();
                    if (user.getPhone() != null && !user.getPhone().isEmpty()) {
                        String message = buildOverdueNotificationMessage(payment, user);
                        whatsAppService.sendWhatsApp(user.getPhone(), message);
                        log.info("Overdue WhatsApp sent to user {} for payment {}", user.getIdUser(), payment.getId());
                    }
                } catch (Exception e) {
                    log.error("Failed to send overdue WhatsApp for payment {}: {}", payment.getId(), e.getMessage());
                }
                
                updated++;
            }
        }

        return updated;
    }

    /**
     * Build overdue notification message
     */
    private String buildOverdueNotificationMessage(EcheancierPayement payment, User user) {
        return String.format(
            "🔔 *Financia - Alerte de Retard*\n\n" +
            "Bonjour *%s*,\n\n" +
            "Votre paiement du *%s* est maintenant en retard.\n\n" +
            "💰 Montant dû: *%.3f TND*\n\n" +
            "⚠️ Merci de régulariser votre situation rapidement pour éviter des pénalités supplémentaires.\n\n" +
            "_Financia - Votre partenaire financier_",
            user.getFirstName(),
            payment.getDueDate(),
            payment.getAmountDue()
        );
    }

    /**
     * Get penalty history for a payment
     */
    public List<PenaltyHistory> getPenaltyHistory(Long echeancierPayementId) {
        return penaltyHistoryRepository.findByEcheancierIdOrderByCalculationDateDesc(echeancierPayementId);
    }

    private void logPenaltyHistory(EcheancierPayement echeancier,
                                   BigDecimal oldPenalty,
                                   BigDecimal newPenalty,
                                   long daysOverdue) {
        PenaltyHistory history = PenaltyHistory.builder()
            .echeancier(echeancier)
            .calculationDate(LocalDate.now())
            .daysOverdue((int) daysOverdue)
            .penaltyAmount(newPenalty)
            .previousPenaltyAmount(oldPenalty)
            .calculationMethod(echeancier.getContrat().getPenaltyType() != null ? 
                echeancier.getContrat().getPenaltyType().toString() : "NONE")
            .createdAt(Instant.now())
            .build();

        penaltyHistoryRepository.save(history);
    }
}
