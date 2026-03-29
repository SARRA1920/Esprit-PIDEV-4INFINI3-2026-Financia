package tn.esprit.financia.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PenaltyHistoryDTO {
    private Long id;
    private LocalDate calculationDate;
    private Integer daysOverdue;
    private BigDecimal penaltyAmount;
    private BigDecimal previousPenaltyAmount;
    private String calculationMethod;
    private Instant createdAt;
}
