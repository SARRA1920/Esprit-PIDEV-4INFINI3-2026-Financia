package tn.esprit.financia.controller.credit;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.credit.BlockingCreditResponse;
import tn.esprit.financia.entities.credit.Credit;
import tn.esprit.financia.entities.credit.StatusC;
import tn.esprit.financia.service.credit.CreditService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CreditController {

    private final CreditService creditService;

    // CREATE
    @PostMapping("/user/{userId}")
    public ResponseEntity<Credit> create(@PathVariable Long userId, @RequestBody Credit credit) {
        return ResponseEntity.ok(creditService.create(credit, userId));
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<Credit>> getAll() {
        return ResponseEntity.ok(creditService.getAll());
    }

    /**
     * Indique si le client a un crédit bloquant une nouvelle demande (même logique que la création).
     * À utiliser par le front pour afficher le formulaire ou le résumé du dossier.
     */
    @GetMapping("/user/{userId}/blocking-info")
    public ResponseEntity<BlockingCreditResponse> getBlockingInfo(@PathVariable Long userId) {
        Optional<Credit> opt = creditService.findBlockingCreditForUser(userId);
        return ResponseEntity.ok(new BlockingCreditResponse(opt.isPresent(), opt.orElse(null)));
    }

    // READ BY USER
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Credit>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(creditService.getByUser(userId));
    }

    // SEARCH (dynamic filters)
    @GetMapping("/search")
    public ResponseEntity<List<Credit>> search(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) StatusC status,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) Integer minDurationMonths,
            @RequestParam(required = false) Integer maxDurationMonths,
            @RequestParam(required = false) BigDecimal minRiskScore,
            @RequestParam(required = false) BigDecimal maxRiskScore,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDateTo
    ) {
        return ResponseEntity.ok(creditService.search(
                userId,
                status,
                minAmount,
                maxAmount,
                minDurationMonths,
                maxDurationMonths,
                minRiskScore,
                maxRiskScore,
                startDateFrom,
                startDateTo
        ));
    }

    // READ ONE (après les chemins fixes /user/... et /search pour éviter les ambiguïtés)
    @GetMapping("/{id}")
    public ResponseEntity<Credit> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(creditService.getById(id));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Credit> update(@PathVariable Long id, @RequestBody Credit updated) {
        return ResponseEntity.ok(creditService.update(id, updated));
    }

    // RECALCULATE RISK SCORE + DECISION
    @PutMapping("/{id}/recalculate")
    public ResponseEntity<Credit> recalculate(@PathVariable Long id) {
        return ResponseEntity.ok(creditService.recalculateRisk(id));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        creditService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

