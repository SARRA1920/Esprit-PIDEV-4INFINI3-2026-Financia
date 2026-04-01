package tn.esprit.financia.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FraudDetectionResult {
    private Long entityId;
    private String entityType; // PARTENAIRE, FOND, COMMITMENT
    private String entityName;
    private double riskScore; // 0-100
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private List<AnomalyFlag> anomalies;
    private String aiModelPrediction;
    private double aiConfidence;
    private String recommendation;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AnomalyFlag {
        private String type;
        private String description;
        private String severity;
        private double score;
    }
}
