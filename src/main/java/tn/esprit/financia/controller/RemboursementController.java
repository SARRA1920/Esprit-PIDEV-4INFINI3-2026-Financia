package tn.esprit.financia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.Remboursement;
import tn.esprit.financia.service.RemboursementService;

import java.util.List;

@RestController
@RequestMapping("/api/remboursements")
@RequiredArgsConstructor
@CrossOrigin("*")
public class RemboursementController {

    private final RemboursementService remboursementService;

    // CREATE (creditId obligatoire pour lier Credit -> Remboursement)
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

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Remboursement> update(@PathVariable Long id, @RequestBody Remboursement updated) {
        return ResponseEntity.ok(remboursementService.update(id, updated));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        remboursementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
