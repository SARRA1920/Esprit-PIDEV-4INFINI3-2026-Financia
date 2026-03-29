package tn.esprit.financia.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PenaltyScheduledTask {

    private final PenaltyCalculationService penaltyService;

    /**
     * Run every day at 1:00 AM
     * Cron format: second minute hour day month weekday
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void updateDailyPenalties() {
        log.info("Starting daily penalty calculation job");

        try {
            // First, check for new overdue payments
            int overdueUpdated = penaltyService.checkAndUpdateOverdueStatus();
            log.info("Marked {} payments as OVERDUE", overdueUpdated);

            // Then update penalties for all overdue payments
            int penaltiesUpdated = penaltyService.updateAllOverduePenalties();
            log.info("Updated {} penalty amounts", penaltiesUpdated);

            log.info("Daily penalty calculation completed successfully");
        } catch (Exception e) {
            log.error("Error during daily penalty calculation", e);
        }
    }

    /**
     * For testing: Run every 5 minutes
     * Uncomment this and comment the above method for testing
     */
    // @Scheduled(cron = "0 */5 * * * *")
    // public void updatePenaltiesEvery5Minutes() {
    //     log.info("Running test penalty calculation (every 5 minutes)");
    //     updateDailyPenalties();
    // }
}
