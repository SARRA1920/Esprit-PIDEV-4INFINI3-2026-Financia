package tn.esprit.financia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.PenaltyHistory;
import tn.esprit.financia.service.PenaltyCalculationService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/penalties")
@RequiredArgsConstructor
public class PenaltyController {

    private final PenaltyCalculationService penaltyService;

    /**
     * Manually trigger penalty calculation for a specific payment
     */
    @PostMapping("/calculate/{echeancierPayementId}")
    public ResponseEntity<Map<String, String>> calculatePenalty(@PathVariable Long echeancierPayementId) {
        try {
            penaltyService.updatePenaltyForPayment(echeancierPayementId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Penalty calculated successfully for payment ID: " + echeancierPayementId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Manually trigger penalty calculation for all overdue payments
     */
    @PostMapping("/calculate-all")
    public ResponseEntity<Map<String, Object>> calculateAllPenalties() {
        try {
            int overdueUpdated = penaltyService.checkAndUpdateOverdueStatus();
            int penaltiesUpdated = penaltyService.updateAllOverduePenalties();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Penalty calculation completed");
            response.put("paymentsMarkedOverdue", overdueUpdated);
            response.put("penaltiesUpdated", penaltiesUpdated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get penalty history for a specific payment
     */
    @GetMapping("/history/{echeancierPayementId}")
    public ResponseEntity<List<PenaltyHistory>> getPenaltyHistory(@PathVariable Long echeancierPayementId) {
        try {
            List<PenaltyHistory> history = penaltyService.getPenaltyHistory(echeancierPayementId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Manually trigger the daily job (for testing)
     */
    @PostMapping("/run-daily-job")
    public ResponseEntity<Map<String, Object>> runDailyJob() {
        try {
            int overdueUpdated = penaltyService.checkAndUpdateOverdueStatus();
            int penaltiesUpdated = penaltyService.updateAllOverduePenalties();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Daily penalty job executed successfully");
            response.put("paymentsMarkedOverdue", overdueUpdated);
            response.put("penaltiesUpdated", penaltiesUpdated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
