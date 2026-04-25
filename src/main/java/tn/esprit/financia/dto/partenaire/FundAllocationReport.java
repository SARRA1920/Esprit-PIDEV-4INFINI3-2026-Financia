package tn.esprit.financia.dto.partenaire;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tn.esprit.financia.entities.partenaire.Fond;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FundAllocationReport {
    private Long fondId;
    private String fundName;
    private double totalAmount;
    private double committedAmount;
    private double allocationPercentage;
    private double remainingCapacity;
    private Fond.FundStatus status;
    private List<PartnerContribution> contributions;
}
