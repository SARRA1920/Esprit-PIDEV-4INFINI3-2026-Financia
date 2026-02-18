package tn.esprit.financia.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerPerformanceMetrics {
    private Long partnerId;
    private String partnerName;
    private Double totalCommittedAmount;
    private Long numberOfActiveFunds;
    private Double averageCommitmentPerFund;
}