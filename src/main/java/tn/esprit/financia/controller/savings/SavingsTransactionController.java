package tn.esprit.financia.controller.savings;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.savings.SavingTransaction;
import tn.esprit.financia.service.savings.SavingsTransactionService;

import java.util.List;

@RestController
@RequestMapping("/api/savings/transactions")
@RequiredArgsConstructor
public class SavingsTransactionController {

    private final SavingsTransactionService service;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @PreAuthorize("hasAnyAuthority('CLIENT', 'ADMIN')")
    @PostMapping
    public ResponseEntity<SavingTransaction> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @io.swagger.v3.oas.annotations.media.Content(
                            examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                                    value = "{ \"type\": \"DEPOSIT\", \"amount\": 500.0, " +
                                            "\"description\": \"First deposit\", \"status\": \"SUCCESS\", " +
                                            "\"savingsAccount\": { \"id\": 6 } }"
                            )
                    )
            )
            @Valid @RequestBody SavingTransaction transaction) {
        return ResponseEntity.ok(service.create(transaction));
    }

    @PreAuthorize("hasAnyAuthority('CLIENT', 'AGENT', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<SavingTransaction>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PreAuthorize("hasAnyAuthority('CLIENT', 'AGENT', 'ADMIN')")
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<SavingTransaction>> getByAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(service.getByAccountId(accountId));
    }

    @PreAuthorize("hasAnyAuthority('CLIENT', 'AGENT', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<SavingTransaction> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                service.getById(id).orElseThrow(() -> new RuntimeException("Transaction not found"))
        );
    }

    @PreAuthorize("hasAnyAuthority('AGENT', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<SavingTransaction> update(
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @io.swagger.v3.oas.annotations.media.Content(
                            examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                                    value = "{ \"status\": \"SUCCESS\" }"
                            )
                    )
            )
            @RequestBody SavingTransaction dto) {
        SavingTransaction existing = service.getById(id).orElseThrow();
        existing.setStatus(dto.getStatus());
        return ResponseEntity.ok(service.update(id, existing));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'AGENT')")
    @GetMapping("/flagged")
    public ResponseEntity<List<SavingTransaction>> getFlaggedTransactions() {
        return ResponseEntity.ok(service.getFlaggedTransactions());
    }
}