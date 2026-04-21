package tn.esprit.financia.controller.credit;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.credit.PaymentRequestDto;
import tn.esprit.financia.entities.credit.PaymentStatus;
import tn.esprit.financia.entities.credit.Remboursement;
import tn.esprit.financia.service.credit.RemboursementService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/remboursements")
@RequiredArgsConstructor
@CrossOrigin("*")
public class RemboursementController {

    private final RemboursementService remboursementService;

    // CREATE
    @PostMapping("/credit/{creditId}")
    public ResponseEntity<Remboursement> create(@PathVariable Long creditId, @RequestBody Remboursement r) {
        return ResponseEntity.ok(remboursementService.create(r, creditId));
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<Remboursement>> getAll() {
        return ResponseEntity.ok(remboursementService.getAll());
    }

    // READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<Remboursement> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(remboursementService.getById(id));
    }

    // READ BY CREDIT
    @GetMapping("/credit/{creditId}")
    public ResponseEntity<List<Remboursement>> getByCredit(@PathVariable Long creditId) {
        return ResponseEntity.ok(remboursementService.getByCredit(creditId));
    }

    // SEARCH (dynamic filters)
    @GetMapping("/search")
    public ResponseEntity<List<Remboursement>> search(
            @RequestParam(required = false) Long creditId,
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime paidFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime paidTo,
            @RequestParam(required = false) Integer minLateDays,
            @RequestParam(required = false) Integer maxLateDays,
            @RequestParam(required = false) Boolean overdue
    ) {
        return ResponseEntity.ok(remboursementService.search(
                creditId,
                status,
                minAmount,
                maxAmount,
                dueFrom,
                dueTo,
                paidFrom,
                paidTo,
                minLateDays,
                maxLateDays,
                overdue
        ));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Remboursement> update(@PathVariable Long id, @RequestBody Remboursement updated) {
        return ResponseEntity.ok(remboursementService.update(id, updated));
    }

    // PAY (mark installment as PAID)
    @PutMapping("/{id}/pay")
    public ResponseEntity<Remboursement> pay(@PathVariable Long id, @RequestBody(required = false) PaymentRequestDto req) {
        return ResponseEntity.ok(remboursementService.pay(id, req != null ? req.getPaymentDate() : null));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        remboursementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

