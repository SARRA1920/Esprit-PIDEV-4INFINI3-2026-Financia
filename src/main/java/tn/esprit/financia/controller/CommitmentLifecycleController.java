package tn.esprit.financia.controller;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.DefaultRequest;
import tn.esprit.financia.dto.PaymentRequest;
import tn.esprit.financia.entities.PartenaireFond;
import tn.esprit.financia.service.ICommitmentLifecycleService;

@RestController
@AllArgsConstructor
@RequestMapping("/api/commitments")
public class CommitmentLifecycleController {

    private final ICommitmentLifecycleService commitmentLifecycleService;

    @PostMapping("/{id}/payment")
    public ResponseEntity<PartenaireFond> processPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        PartenaireFond updated = commitmentLifecycleService.processPayment(
                id,
                request.getPaymentAmount(),
                request.getPaymentDate()
        );
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/default")
    public ResponseEntity<PartenaireFond> markDefaulted(
            @PathVariable Long id,
            @Valid @RequestBody DefaultRequest request) {
        PartenaireFond updated = commitmentLifecycleService.markDefaulted(
                id,
                request.getDefaultDate(),
                request.getReason()
        );
        return ResponseEntity.ok(updated);
    }
}
