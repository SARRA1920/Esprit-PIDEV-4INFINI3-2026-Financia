package tn.esprit.financia.dto.savings.ml;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FraudRequest {
    private Long accountId;
    private TransactionInfo transaction;
    private List<TransactionHistory> history;

    @Data
    public static class TransactionInfo {
        private Double amount;
        private String type;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime timestamp;
    }

    @Data
    public static class TransactionHistory {
        private Double amount;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime timestamp;
        private String type;
    }
}