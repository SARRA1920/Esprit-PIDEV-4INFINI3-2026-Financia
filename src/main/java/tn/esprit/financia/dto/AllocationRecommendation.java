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
public class AllocationRecommendation {
    private Long fondId;
    private String fondName;
    private double totalCapacity;
    private double currentCommitted;
    private double availableCapacity;
    private double utilizationRate;
    private String allocationStrategy;
    private List<PartenaireRecommendation> recommendedPartenaires;
    private List<String> warnings;
    private double confidenceScore;
    private String aiModelVersion;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PartenaireRecommendation {
        private Long partenaireId;
        private String partenaireName;
        private double recommendedAmount;
        private double maxSafeAmount;
        private String riskLevel;
        private double riskScore;
        private double performanceScore;
        private String rationale;
        private int priority; // 1 = highest priority
    }
}
