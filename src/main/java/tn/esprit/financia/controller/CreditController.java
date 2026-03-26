package tn.esprit.financia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.Credit;
import tn.esprit.financia.service.CreditService;

import java.util.List;

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

    // READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<Credit> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(creditService.getById(id));
    }

    // READ BY USER
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Credit>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(creditService.getByUser(userId));
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
