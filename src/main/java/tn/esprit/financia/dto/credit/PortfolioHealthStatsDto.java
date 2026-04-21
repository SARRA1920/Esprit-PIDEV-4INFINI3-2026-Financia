package tn.esprit.financia.dto.credit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioHealthStatsDto {
    private long totalCreditsCount;
    private BigDecimal totalGrantedAmount;
    private Map<String, Long> creditsByStatus;
    private BigDecimal avgRiskScore;
    private Map<String, Long> riskDistributionBuckets;
    private long overdueCreditsCount;
    private long overdueInstallmentsCount;
    private int maxLateDaysOverall;
    private double portfolioLateRate;
}

