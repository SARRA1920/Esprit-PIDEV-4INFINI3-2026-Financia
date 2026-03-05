package tn.esprit.financia.controller;

import tn.esprit.financia.entities.Partenaire;
import tn.esprit.financia.dto.PartnerPerformanceMetrics;
import tn.esprit.financia.service.IPartenaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partenaires")
public class PartenaireController {

    @Autowired
    private IPartenaireService partenaireService;

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
        // Update fields from partenaireDetails to the fetched partenaire object
        partenaire.setName(partenaireDetails.getName());
        partenaire.setType(partenaireDetails.getType());
        partenaire.setEmail(partenaireDetails.getEmail());
        partenaire.setPhone(partenaireDetails.getPhone());
        partenaire.setAddress(partenaireDetails.getAddress());
        partenaire.setWebsite(partenaireDetails.getWebsite());
        partenaire.setStatus(partenaireDetails.getStatus());
        // createdAt should not be updated here, it's set @PrePersist

        Partenaire updatedPartenaire = partenaireService.save(partenaire);
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

    @GetMapping("/{partnerId}/performance")
    public ResponseEntity<PartnerPerformanceMetrics> getPartnerPerformanceMetrics(@PathVariable Long partnerId) {
        PartnerPerformanceMetrics metrics = partenaireService.getPartnerPerformanceMetrics(partnerId);
        return new ResponseEntity<>(metrics, HttpStatus.OK);
    }

    @PutMapping("/{partnerId}/status")
    public ResponseEntity<Void> updatePartnerStatus(@PathVariable Long partnerId) {
        partenaireService.updatePartnerStatus(partnerId);
        return ResponseEntity.ok().build();
    }
}