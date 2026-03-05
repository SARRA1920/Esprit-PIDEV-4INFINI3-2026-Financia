package tn.esprit.financia.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AllocationMetrics {
    private double allocationPercentage;
    private double remainingCapacity;
    private double committedAmount;
    private double totalAmount;
}
