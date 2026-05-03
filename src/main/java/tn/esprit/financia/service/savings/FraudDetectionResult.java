package tn.esprit.financia.service.savings;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class FraudDetectionResult {
    private double score;           // 0-100
    private boolean isHighRisk;
    private List<String> reasons;

    public boolean shouldBlock() {
        return isHighRisk; // you can change threshold logic here
    }
}