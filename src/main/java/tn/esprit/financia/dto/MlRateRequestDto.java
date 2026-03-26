package tn.esprit.financia.dto;

import java.math.BigDecimal;

public record MlRateRequestDto(
        BigDecimal amount,
        Integer durationMonths,
        BigDecimal income,
        BigDecimal riskScore
) {}

