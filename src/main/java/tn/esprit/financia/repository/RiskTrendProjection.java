package tn.esprit.financia.repository;

import java.math.BigDecimal;

public interface RiskTrendProjection {
    String getPeriod();
    BigDecimal getAvgRisk();
    Long getTotalEvents();
}
