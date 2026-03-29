package tn.esprit.financia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.EcheancierPayementDTO;
import tn.esprit.financia.entities.Contrat;
import tn.esprit.financia.entities.EcheancierPayement;
import tn.esprit.financia.service.ContratService;
import tn.esprit.financia.service.EcheancierPayementService;
import tn.esprit.financia.service.PdfGeneratorService;

import java.util.List;

@RestController
@RequestMapping("/api/echeanciers")
@RequiredArgsConstructor
public class EcheancierPayementController {

    private final EcheancierPayementService echeancierService;
    private final ContratService contratService;
    private final PdfGeneratorService pdfGeneratorService;

    @PostMapping("/contrat/{contratId}")
    public ResponseEntity<EcheancierPayement> create(@RequestBody EcheancierPayementDTO dto, @PathVariable Long contratId) {
        EcheancierPayement echeancier = EcheancierPayement.builder()
                .dueDate(dto.getDueDate())
                .amountDue(dto.getAmountDue())
                .principalAmount(dto.getPrincipalAmount())
                .interestAmount(dto.getInterestAmount())
                .penaltyAmount(dto.getPenaltyAmount())
                .status(dto.getStatus())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(echeancierService.create(echeancier, contratId));
    }

    @GetMapping
    public ResponseEntity<List<EcheancierPayement>> getAll() {
        return ResponseEntity.ok(echeancierService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EcheancierPayement> getById(@PathVariable Long id) {
        return ResponseEntity.ok(echeancierService.getById(id));
    }

    @GetMapping("/contrat/{contratId}")
    public ResponseEntity<List<EcheancierPayement>> getByContratId(@PathVariable Long contratId) {
        return ResponseEntity.ok(echeancierService.getByContratId(contratId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EcheancierPayement> update(@PathVariable Long id, @RequestBody EcheancierPayementDTO dto) {
        EcheancierPayement echeancier = EcheancierPayement.builder()
                .dueDate(dto.getDueDate())
                .amountDue(dto.getAmountDue())
                .principalAmount(dto.getPrincipalAmount())
                .interestAmount(dto.getInterestAmount())
                .penaltyAmount(dto.getPenaltyAmount())
                .status(dto.getStatus())
                .build();
        return ResponseEntity.ok(echeancierService.update(id, echeancier));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        echeancierService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contrat/{contratId}/schedule-pdf")
    public ResponseEntity<byte[]> generatePaymentSchedulePdf(@PathVariable Long contratId) {
        try {
            Contrat contrat = contratService.getById(contratId);
            List<EcheancierPayement> payments = echeancierService.getByContratId(contratId);
            byte[] pdfBytes = pdfGeneratorService.generatePaymentSchedulePdf(payments, contrat, contrat.getCredit().getUser());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "payment-schedule-" + contratId + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/contrat/{contratId}/download-schedule-pdf")
    public ResponseEntity<byte[]> downloadPaymentSchedulePdf(@PathVariable Long contratId) {
        try {
            Contrat contrat = contratService.getById(contratId);
            List<EcheancierPayement> payments = echeancierService.getByContratId(contratId);
            byte[] pdfBytes = pdfGeneratorService.generatePaymentSchedulePdf(payments, contrat, contrat.getCredit().getUser());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "payment-schedule-" + contratId + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
