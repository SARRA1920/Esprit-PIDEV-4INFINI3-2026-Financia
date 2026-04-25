/** Aligné sur {@link tn.esprit.financia.dto.credit.PortfolioHealthStatsDto}. */
export interface PortfolioHealthStats {
  totalCreditsCount: number;
  totalGrantedAmount: number;
  creditsByStatus: Record<string, number>;
  avgRiskScore: number;
  riskDistributionBuckets: Record<string, number>;
  overdueCreditsCount: number;
  overdueInstallmentsCount: number;
  maxLateDaysOverall: number;
  portfolioLateRate: number;
}
