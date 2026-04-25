package tn.esprit.financia.dto.partenaire;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FraudDebugInfo {
    private Long partenaireId;
    private String partenaireName;
    private int totalCommitments;
    private int defaultedCommitments;
    private double defaultRate;
    private int recentCommitments;
    private int paidCommitments;
    private int latePayments;
    private double avgCommitment;
    private double maxCommitment;
    private LocalDate oldestCommitmentDate;
    private long accountAgeDays;
    private List<CommitmentDebug> commitments;
    private Map<String, String> ruleResults;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CommitmentDebug {
        private Long id;
        private double amount;
        private LocalDate commitmentDate;
        private LocalDate paymentDate;
        private String status;
        private Long daysBetween;
        private boolean isLate;
        private boolean isRecent;
    }
}
