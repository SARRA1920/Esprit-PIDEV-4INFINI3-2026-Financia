package tn.esprit.financia.dto;

import lombok.*;
import tn.esprit.financia.entities.StatusC;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreditDTO {
    private BigDecimal amount;
    private BigDecimal interestRate;
    private Integer durationMonths;
    private LocalDate startDate;
    private LocalDate endDate;
    private StatusC status;
    private BigDecimal riskScore;
}
