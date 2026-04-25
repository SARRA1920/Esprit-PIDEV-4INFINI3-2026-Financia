package tn.esprit.financia.dto.partenaire;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmailFraudAnalysis {
    private String emailId;
    private Long partenaireId;
    private String partenaireName;
    private String senderEmail;
    private String subject;
    private double fraudScore; // 0-100
    private String fraudLevel; // SAFE, SUSPICIOUS, LIKELY_FRAUD, CONFIRMED_FRAUD
    private List<FraudIndicator> indicators;
    private String aiModelPrediction;
    private double aiConfidence;
    private String recommendation;
    private boolean shouldBlock;
    private String analysis;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FraudIndicator {
        private String type;
        private String description;
        private String severity;
        private double score;
        private String evidence;
    }
}
