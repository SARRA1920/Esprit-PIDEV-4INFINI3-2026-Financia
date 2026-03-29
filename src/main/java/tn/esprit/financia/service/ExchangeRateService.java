package tn.esprit.financia.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tn.esprit.financia.dto.ExchangeRateResponse;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExchangeRateService {

    // Using exchangerate-api.com - supports TND and many more currencies
    private static final String API_URL = "https://open.er-api.com/v6/latest";
    private final RestTemplate restTemplate;

    /**
     * Get exchange rate between two currencies
     * @param from Source currency (e.g., "USD")
     * @param to Target currency (e.g., "TND")
     * @return Exchange rate
     */
    public BigDecimal getExchangeRate(String from, String to) {
        try {
            String url = String.format("%s/%s", API_URL, from);
            log.info("Calling Exchange Rate API: {}", url);
            
            ExchangeRateResponse response = restTemplate.getForObject(url, ExchangeRateResponse.class);
            
            if (response != null && response.getRates() != null && response.getRates().containsKey(to)) {
                BigDecimal rate = response.getRates().get(to);
                log.info("Exchange rate from {} to {}: {}", from, to, rate);
                return rate;
            }
            
            log.warn("No exchange rate found for {} to {}", from, to);
            return BigDecimal.ONE;
            
        } catch (Exception e) {
            log.error("Failed to get exchange rate from {} to {}: {}", from, to, e.getMessage());
            return BigDecimal.ONE; // Fallback to 1:1 rate
        }
    }

    /**
     * Convert amount from one currency to another
     * @param amount Amount to convert
     * @param from Source currency
     * @param to Target currency
     * @return Converted amount
     */
    public BigDecimal convertAmount(BigDecimal amount, String from, String to) {
        if (from.equalsIgnoreCase(to)) {
            return amount;
        }
        
        BigDecimal rate = getExchangeRate(from, to);
        BigDecimal convertedAmount = amount.multiply(rate).setScale(3, RoundingMode.HALF_UP);
        
        log.info("Converted {} {} to {} {}", amount, from, convertedAmount, to);
        return convertedAmount;
    }

    /**
     * Get all available exchange rates for a base currency
     * @param baseCurrency Base currency (e.g., "USD")
     * @return Map of currency codes to exchange rates
     */
    public Map<String, BigDecimal> getLatestRates(String baseCurrency) {
        try {
            String url = String.format("%s/%s", API_URL, baseCurrency);
            log.info("Calling Exchange Rate API for all rates: {}", url);
            
            ExchangeRateResponse response = restTemplate.getForObject(url, ExchangeRateResponse.class);
            
            if (response != null && response.getRates() != null) {
                log.info("Retrieved {} exchange rates for {}", response.getRates().size(), baseCurrency);
                return response.getRates();
            }
            
            log.warn("No exchange rates found for {}", baseCurrency);
            return Map.of();
            
        } catch (Exception e) {
            log.error("Failed to get exchange rates for {}: {}", baseCurrency, e.getMessage());
            return Map.of();
        }
    }

    /**
     * Get exchange rate information with date
     * @param from Source currency
     * @param to Target currency
     * @return Full exchange rate response with date
     */
    public ExchangeRateResponse getExchangeRateInfo(String from, String to) {
        try {
            String url = String.format("%s/%s", API_URL, from);
            log.info("Calling Exchange Rate API: {}", url);
            
            ExchangeRateResponse response = restTemplate.getForObject(url, ExchangeRateResponse.class);
            log.info("Exchange rate info retrieved: {} {} = {} {}", 
                    response.getAmount(), from, response.getRates().get(to), to);
            
            return response;
            
        } catch (Exception e) {
            log.error("Failed to get exchange rate info: {}", e.getMessage());
            throw new RuntimeException("Failed to get exchange rate: " + e.getMessage());
        }
    }
}
