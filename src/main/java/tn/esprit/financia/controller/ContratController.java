package tn.esprit.financia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.ContratDTO;
import tn.esprit.financia.entities.Contrat;
import tn.esprit.financia.service.ContratService;
import tn.esprit.financia.service.EmailService;
import tn.esprit.financia.service.ExchangeRateService;
import tn.esprit.financia.service.PdfGeneratorService;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contrats")
@RequiredArgsConstructor
public class ContratController {

    private final ContratService contratService;
    private final EmailService emailService;
    private final PdfGeneratorService pdfGeneratorService;
    private final ExchangeRateService exchangeRateService;

    @PostMapping("/credit/{creditId}")
    public ResponseEntity<Contrat> create(@RequestBody ContratDTO contratDTO, @PathVariable Long creditId) {
        Contrat contrat = Contrat.builder()
                .signedDate(contratDTO.getSignedDate())
                .amount(contratDTO.getAmount())
                .rate(contratDTO.getRate())
                .duration(contratDTO.getDuration())
                .status(contratDTO.getStatus())
                .version(contratDTO.getVersion())
                .type(contratDTO.getType())
                .currency(contratDTO.getCurrency() != null ? contratDTO.getCurrency() : "TND")
                .penaltyRate(contratDTO.getPenaltyRate())
                .penaltyType(contratDTO.getPenaltyType())
                .gracePeriodDays(contratDTO.getGracePeriodDays())
                .build();
        
        // If currency is not TND, convert and store both amounts
        if (contrat.getCurrency() != null && !contrat.getCurrency().equalsIgnoreCase("TND")) {
            contrat.setOriginalAmount(contrat.getAmount());
            BigDecimal rate = exchangeRateService.getExchangeRate(contrat.getCurrency(), "TND");
            contrat.setAmountInTND(exchangeRateService.convertAmount(contrat.getAmount(), contrat.getCurrency(), "TND"));
            contrat.setExchangeRateUsed(rate);
        } else {
            // If already in TND, just set the same values
            contrat.setOriginalAmount(contrat.getAmount());
            contrat.setAmountInTND(contrat.getAmount());
            contrat.setExchangeRateUsed(BigDecimal.ONE);
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(contratService.create(contrat, creditId));
    }

    @GetMapping
    public ResponseEntity<List<Contrat>> getAll() {
        return ResponseEntity.ok(contratService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contrat> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contratService.getById(id));
    }

    @GetMapping("/credit/{creditId}")
    public ResponseEntity<Contrat> getByCreditId(@PathVariable Long creditId) {
        return ResponseEntity.ok(contratService.getByCreditId(creditId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contrat> update(@PathVariable Long id, @RequestBody ContratDTO contratDTO) {
        Contrat contrat = Contrat.builder()
                .signedDate(contratDTO.getSignedDate())
                .amount(contratDTO.getAmount())
                .rate(contratDTO.getRate())
                .duration(contratDTO.getDuration())
                .status(contratDTO.getStatus())
                .version(contratDTO.getVersion())
                .type(contratDTO.getType())
                .penaltyRate(contratDTO.getPenaltyRate())
                .penaltyType(contratDTO.getPenaltyType())
                .gracePeriodDays(contratDTO.getGracePeriodDays())
                .build();
        return ResponseEntity.ok(contratService.update(id, contrat));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contratService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/send-email")
    public ResponseEntity<String> sendContractEmail(@PathVariable Long id) {
        try {
            Contrat contrat = contratService.getById(id);
            emailService.sendContractEmail(contrat, contrat.getCredit().getUser());
            return ResponseEntity.ok("Contract email sent successfully to " + contrat.getCredit().getUser().getEmail());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send email: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> generateContractPdf(@PathVariable Long id) {
        try {
            Contrat contrat = contratService.getById(id);
            byte[] pdfBytes = pdfGeneratorService.generateContractPdf(contrat, contrat.getCredit().getUser());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "contract-" + id + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/download-pdf")
    public ResponseEntity<byte[]> downloadContractPdf(@PathVariable Long id) {
        try {
            Contrat contrat = contratService.getById(id);
            byte[] pdfBytes = pdfGeneratorService.generateContractPdf(contrat, contrat.getCredit().getUser());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "contract-" + id + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/convert-currency")
    public ResponseEntity<Map<String, Object>> convertContractCurrency(
            @PathVariable Long id,
            @RequestParam String toCurrency) {
        try {
            Contrat contrat = contratService.getById(id);
            String fromCurrency = contrat.getCurrency() != null ? contrat.getCurrency() : "TND";
            
            BigDecimal rate = exchangeRateService.getExchangeRate(fromCurrency, toCurrency);
            BigDecimal convertedAmount = exchangeRateService.convertAmount(contrat.getAmount(), fromCurrency, toCurrency);
            
            Map<String, Object> response = new HashMap<>();
            response.put("contractId", id);
            response.put("originalAmount", contrat.getAmount());
            response.put("originalCurrency", fromCurrency);
            response.put("convertedAmount", convertedAmount);
            response.put("targetCurrency", toCurrency);
            response.put("exchangeRate", rate);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/multi-currency-view")
    public ResponseEntity<Map<String, Object>> getMultiCurrencyView(@PathVariable Long id) {
        try {
            Contrat contrat = contratService.getById(id);
            String baseCurrency = contrat.getCurrency() != null ? contrat.getCurrency() : "TND";
            
            Map<String, Object> response = new HashMap<>();
            response.put("contractId", id);
            response.put("baseCurrency", baseCurrency);
            response.put("baseAmount", contrat.getAmount());
            
            // Convert to multiple currencies
            Map<String, BigDecimal> conversions = new HashMap<>();
            conversions.put("USD", exchangeRateService.convertAmount(contrat.getAmount(), baseCurrency, "USD"));
            conversions.put("EUR", exchangeRateService.convertAmount(contrat.getAmount(), baseCurrency, "EUR"));
            conversions.put("TND", exchangeRateService.convertAmount(contrat.getAmount(), baseCurrency, "TND"));
            conversions.put("GBP", exchangeRateService.convertAmount(contrat.getAmount(), baseCurrency, "GBP"));
            
            response.put("conversions", conversions);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
