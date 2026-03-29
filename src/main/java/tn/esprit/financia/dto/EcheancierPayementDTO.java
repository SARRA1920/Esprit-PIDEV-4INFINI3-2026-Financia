package tn.esprit.financia.dto;

import lombok.*;
import tn.esprit.financia.entities.enums.StatusE;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EcheancierPayementDTO {
    private LocalDate dueDate;
    private BigDecimal amountDue;
    private BigDecimal principalAmount;
    private BigDecimal interestAmount;
    private BigDecimal penaltyAmount;
    private StatusE status;
}
