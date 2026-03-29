package tn.esprit.financia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.ExchangeRateResponse;
import tn.esprit.financia.service.ExchangeRateService;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/exchange-rate")
@RequiredArgsConstructor
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    /**
     * Get exchange rate between two currencies
     * Example: GET /api/exchange-rate?from=USD&to=TND
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getExchangeRate(
            @RequestParam String from,
            @RequestParam String to) {
        
        BigDecimal rate = exchangeRateService.getExchangeRate(from, to);
        
        Map<String, Object> response = new HashMap<>();
        response.put("from", from);
        response.put("to", to);
        response.put("rate", rate);
        response.put("message", String.format("1 %s = %s %s", from, rate, to));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Convert amount between currencies
     * Example: GET /api/exchange-rate/convert?amount=1000&from=USD&to=TND
     */
    @GetMapping("/convert")
    public ResponseEntity<Map<String, Object>> convertAmount(
            @RequestParam BigDecimal amount,
            @RequestParam String from,
            @RequestParam String to) {
        
        BigDecimal rate = exchangeRateService.getExchangeRate(from, to);
        BigDecimal convertedAmount = exchangeRateService.convertAmount(amount, from, to);
        
        Map<String, Object> response = new HashMap<>();
        response.put("originalAmount", amount);
        response.put("originalCurrency", from);
        response.put("convertedAmount", convertedAmount);
        response.put("targetCurrency", to);
        response.put("exchangeRate", rate);
        response.put("message", String.format("%s %s = %s %s", amount, from, convertedAmount, to));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all exchange rates for a base currency
     * Example: GET /api/exchange-rate/rates/USD
     */
    @GetMapping("/rates/{baseCurrency}")
    public ResponseEntity<Map<String, BigDecimal>> getAllRates(@PathVariable String baseCurrency) {
        Map<String, BigDecimal> rates = exchangeRateService.getLatestRates(baseCurrency);
        return ResponseEntity.ok(rates);
    }

    /**
     * Get detailed exchange rate information
     * Example: GET /api/exchange-rate/info?from=USD&to=TND
     */
    @GetMapping("/info")
    public ResponseEntity<ExchangeRateResponse> getExchangeRateInfo(
            @RequestParam String from,
            @RequestParam String to) {
        
        ExchangeRateResponse response = exchangeRateService.getExchangeRateInfo(from, to);
        return ResponseEntity.ok(response);
    }

    /**
     * Get supported currencies
     */
    @GetMapping("/currencies")
    public ResponseEntity<Map<String, String>> getSupportedCurrencies() {
        Map<String, String> currencies = new HashMap<>();
        currencies.put("USD", "US Dollar");
        currencies.put("EUR", "Euro");
        currencies.put("TND", "Tunisian Dinar");
        currencies.put("GBP", "British Pound");
        currencies.put("JPY", "Japanese Yen");
        currencies.put("CAD", "Canadian Dollar");
        currencies.put("AUD", "Australian Dollar");
        currencies.put("CHF", "Swiss Franc");
        
        return ResponseEntity.ok(currencies);
    }
}
