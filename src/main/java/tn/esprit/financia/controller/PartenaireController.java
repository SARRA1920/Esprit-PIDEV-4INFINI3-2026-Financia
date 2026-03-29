package tn.esprit.financia.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.Partenaire;
import tn.esprit.financia.service.IPartenaireService;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/partenaires")
public class PartenaireController {

    private final IPartenaireService partenaireService;

    @GetMapping
    public List<Partenaire> getAllPartenaires() {
        return partenaireService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partenaire> getPartenaireById(@PathVariable Long id) {
        Partenaire partenaire = partenaireService.findById(id);
        return partenaire != null ? ResponseEntity.ok(partenaire) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Partenaire> createPartenaire(@RequestBody Partenaire partenaire) {
        Partenaire savedPartenaire = partenaireService.save(partenaire);
        return new ResponseEntity<>(savedPartenaire, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Partenaire> updatePartenaire(@PathVariable Long id, @RequestBody Partenaire partenaireDetails) {
        Partenaire partenaire = partenaireService.findById(id);
        if (partenaire == null) {
            return ResponseEntity.notFound().build();
        }
        // You can add specific field updates here if needed
        partenaireDetails.setIdPartenaire(id);
        Partenaire updatedPartenaire = partenaireService.save(partenaireDetails);
        return ResponseEntity.ok(updatedPartenaire);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartenaire(@PathVariable Long id) {
        if (partenaireService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        partenaireService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}