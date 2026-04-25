package tn.esprit.financia.controller.partenaire;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.partenaire.EmailAnalysisRequest;
import tn.esprit.financia.dto.partenaire.EmailFraudAnalysis;
import tn.esprit.financia.service.partenaire.EmailFraudDetectionService;

@RestController
@RequestMapping("/api/email-fraud-detection")
@RequiredArgsConstructor
public class EmailFraudDetectionController {

    private final EmailFraudDetectionService emailFraudDetectionService;

    /**
     * Analyze an email for fraud indicators
     */
    @PostMapping("/analyze")
    public ResponseEntity<EmailFraudAnalysis> analyzeEmail(@RequestBody EmailAnalysisRequest request) {
        EmailFraudAnalysis analysis = emailFraudDetectionService.analyzeEmail(request);
        return ResponseEntity.ok(analysis);
    }
}
