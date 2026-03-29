package tn.esprit.financia.dto;

import lombok.*;
import tn.esprit.financia.entities.enums.PenaltyType;
import tn.esprit.financia.entities.enums.TypeContrat;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ContratDTO {
    private LocalDate signedDate;
    private BigDecimal amount;
    private BigDecimal rate;
    private Integer duration;
    private String status;
    private String version;
    private TypeContrat type;
    private String currency; // NEW: "USD", "EUR", "TND", etc.
    
    // Penalty Configuration
    private BigDecimal penaltyRate;
    private PenaltyType penaltyType;
    private Integer gracePeriodDays;
}
