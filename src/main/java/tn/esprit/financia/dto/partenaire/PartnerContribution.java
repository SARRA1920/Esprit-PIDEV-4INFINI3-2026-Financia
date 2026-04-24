package tn.esprit.financia.dto.partenaire;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tn.esprit.financia.entities.partenaire.enums.CommitmentStatus;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PartnerContribution {
    private Long partnerId;
    private String partnerName;
    private double committedAmount;
    private CommitmentStatus status;
    private LocalDate commitmentDate;
}
