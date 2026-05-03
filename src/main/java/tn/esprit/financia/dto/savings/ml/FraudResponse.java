package tn.esprit.financia.dto.savings.ml;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudResponse {
    private double score;
    private boolean isHighRisk;
    private List<String> reasons;
}