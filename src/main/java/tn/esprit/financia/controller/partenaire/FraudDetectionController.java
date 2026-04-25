package tn.esprit.financia.controller.partenaire;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.partenaire.FraudDetectionResult;
import tn.esprit.financia.service.partenaire.FraudDetectionService;

import java.util.List;

@RestController
@RequestMapping("/api/fraud-detection")
@RequiredArgsConstructor
public class FraudDetectionController {

    private final FraudDetectionService fraudDetectionService;

    @GetMapping("/partenaire/{partenaireId}")
    public ResponseEntity<FraudDetectionResult> detectPartenaireFraud(@PathVariable Long partenaireId) {
        FraudDetectionResult result = fraudDetectionService.detectPartnerFraud(partenaireId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/partenaire/{partenaireId}/debug")
    public ResponseEntity<?> debugPartenaireFraud(@PathVariable Long partenaireId) {
        return ResponseEntity.ok(fraudDetectionService.debugPartnerFraud(partenaireId));
    }

    @GetMapping("/commitment/{commitmentId}")
    public ResponseEntity<FraudDetectionResult> detectCommitmentFraud(@PathVariable Long commitmentId) {
        FraudDetectionResult result = fraudDetectionService.detectCommitmentFraud(commitmentId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/scan-all")
    public ResponseEntity<List<FraudDetectionResult>> scanAllForFraud() {
        List<FraudDetectionResult> results = fraudDetectionService.scanAllForFraud();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/high-risk")
    public ResponseEntity<List<FraudDetectionResult>> getHighRiskEntities() {
        List<FraudDetectionResult> results = fraudDetectionService.scanAllForFraud();
        List<FraudDetectionResult> highRisk = results.stream()
                .filter(r -> r.getRiskScore() >= 50)
                .toList();
        return ResponseEntity.ok(highRisk);
    }

    @GetMapping("/critical-alerts")
    public ResponseEntity<List<FraudDetectionResult>> getCriticalAlerts() {
        List<FraudDetectionResult> results = fraudDetectionService.scanAllForFraud();
        List<FraudDetectionResult> critical = results.stream()
                .filter(r -> r.getRiskScore() >= 70)
                .toList();
        return ResponseEntity.ok(critical);
    }
}
