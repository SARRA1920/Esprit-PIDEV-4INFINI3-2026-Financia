package tn.esprit.financia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.CreditDTO;
import tn.esprit.financia.entities.Credit;
import tn.esprit.financia.service.CreditService;

import java.util.List;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CreditController {

    private final CreditService creditService;

    // CREATE (userId obligatoire pour lier User -> Credit)
    @PostMapping("/user/{userId}")
    public ResponseEntity<Credit> create(@PathVariable Long userId, @RequestBody CreditDTO creditDTO) {
        Credit credit = Credit.builder()
                .amount(creditDTO.getAmount())
                .interestRate(creditDTO.getInterestRate())
                .durationMonths(creditDTO.getDurationMonths())
                .startDate(creditDTO.getStartDate())
                .endDate(creditDTO.getEndDate())
                .status(creditDTO.getStatus())
                .riskScore(creditDTO.getRiskScore())
                .build();
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
    public ResponseEntity<Credit> update(@PathVariable Long id, @RequestBody CreditDTO creditDTO) {
        Credit updated = Credit.builder()
                .amount(creditDTO.getAmount())
                .interestRate(creditDTO.getInterestRate())
                .durationMonths(creditDTO.getDurationMonths())
                .startDate(creditDTO.getStartDate())
                .endDate(creditDTO.getEndDate())
                .status(creditDTO.getStatus())
                .riskScore(creditDTO.getRiskScore())
                .build();
        return ResponseEntity.ok(creditService.update(id, updated));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        creditService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
