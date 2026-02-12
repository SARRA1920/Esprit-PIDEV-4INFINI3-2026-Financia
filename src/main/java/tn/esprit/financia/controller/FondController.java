package tn.esprit.financia.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.Fond;
import tn.esprit.financia.service.IFondService;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/fonds")
public class FondController {

    private final IFondService fondService;

    @GetMapping
    public List<Fond> getAllFonds() {
        return fondService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fond> getFondById(@PathVariable Long id) {
        Fond fond = fondService.findById(id);
        return fond != null ? ResponseEntity.ok(fond) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Fond> createFond(@RequestBody Fond fond) {
        Fond savedFond = fondService.save(fond);
        return new ResponseEntity<>(savedFond, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fond> updateFond(@PathVariable Long id, @RequestBody Fond fondDetails) {
        if (fondService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        fondDetails.setIdFond(id);
        Fond updatedFond = fondService.save(fondDetails);
        return ResponseEntity.ok(updatedFond);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFond(@PathVariable Long id) {
        if (fondService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        fondService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}