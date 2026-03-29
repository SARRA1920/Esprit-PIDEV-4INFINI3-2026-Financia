package tn.esprit.financia.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExchangeRateResponse {
    private BigDecimal amount;
    private String base;
    private String date;
    private Map<String, BigDecimal> rates;
}
