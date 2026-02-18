package tn.esprit.financia.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.Fond;
import tn.esprit.financia.entities.Partenaire;
import tn.esprit.financia.entities.PartenaireFond;
import tn.esprit.financia.service.IFondService;
import tn.esprit.financia.service.IPartenaireFondService;
import tn.esprit.financia.service.IPartenaireService;

import java.util.List;

@RestController
@RequestMapping("/api/partenaire-fonds")
public class PartenaireFondController {

    private final IPartenaireFondService partenaireFondService;
    private final IPartenaireService partenaireService;
    private final IFondService fondService;

    
    public PartenaireFondController(IPartenaireFondService partenaireFondService, IPartenaireService partenaireService, IFondService fondService) {
        this.partenaireFondService = partenaireFondService;
        this.partenaireService = partenaireService;
        this.fondService = fondService;
    }

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
        // Fetch the complete Partenaire and Fond entities from the database
        Partenaire partenaire = partenaireService.findById(partenaireFond.getPartenaire().getIdPartenaire());
        Fond fond = fondService.findById(partenaireFond.getFond().getIdFond());

        if (partenaire == null || fond == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Or handle error appropriately
        }

        // Set the fetched entities to the PartenaireFond object
        partenaireFond.setPartenaire(partenaire);
        partenaireFond.setFond(fond);

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