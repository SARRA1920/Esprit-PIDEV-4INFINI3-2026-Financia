package tn.esprit.financia.dto.savings;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalPredictionResult {
    private Long goalId;
    private String verdict;          // e.g., "On track", "At risk", "No data"
    private String advice;           // e.g., "Keep up the good work! ..."
    private LocalDate predictedCompletionDate;
    private double completionProbability; // optional
    private String message;          // additional info
}