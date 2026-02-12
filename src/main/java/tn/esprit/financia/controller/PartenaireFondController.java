package tn.esprit.financia.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.PartenaireFond;
import tn.esprit.financia.service.IPartenaireFondService;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/partenaire-fonds")
public class PartenaireFondController {

    private final IPartenaireFondService partenaireFondService;

    @GetMapping
    public List<PartenaireFond> getAllPartenaireFonds() {
        return partenaireFondService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartenaireFond> getPartenaireFondById(@PathVariable Long id) {
        PartenaireFond partenaireFond = partenaireFondService.findById(id);
        return partenaireFond != null ? ResponseEntity.ok(partenaireFond) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<PartenaireFond> createPartenaireFond(@RequestBody PartenaireFond partenaireFond) {
        PartenaireFond savedPartenaireFond = partenaireFondService.save(partenaireFond);
        return new ResponseEntity<>(savedPartenaireFond, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartenaireFond> updatePartenaireFond(@PathVariable Long id, @RequestBody PartenaireFond details) {
        details.setId(id);
        PartenaireFond updated = partenaireFondService.save(details);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartenaireFond(@PathVariable Long id) {
        if (partenaireFondService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        partenaireFondService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}