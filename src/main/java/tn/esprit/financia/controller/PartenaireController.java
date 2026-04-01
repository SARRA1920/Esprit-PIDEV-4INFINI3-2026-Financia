package tn.esprit.financia.controller;

import tn.esprit.financia.entities.Partenaire;
import tn.esprit.financia.entities.PartenaireFond;
import tn.esprit.financia.dto.PartnerPerformanceMetrics;
import tn.esprit.financia.service.IPartenaireService;
import tn.esprit.financia.service.IPartenaireFondService;
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
    
    @Autowired
    private IPartenaireFondService partenaireFondService;

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

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Partenaire>> getPartenairesByType(@PathVariable String type) {
        List<Partenaire> partenaires = partenaireService.findAll().stream()
                .filter(p -> p.getType().name().equals(type))
                .toList();
        return ResponseEntity.ok(partenaires);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Partenaire>> getPartenairesByStatus(@PathVariable String status) {
        List<Partenaire> partenaires = partenaireService.findAll().stream()
                .filter(p -> p.getStatus().name().equals(status))
                .toList();
        return ResponseEntity.ok(partenaires);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Partenaire>> getActivePartenaires() {
        List<Partenaire> partenaires = partenaireService.findAll().stream()
                .filter(p -> p.getStatus() == Partenaire.PartnerStatus.ACTIVE)
                .toList();
        return ResponseEntity.ok(partenaires);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Partenaire>> searchPartenaires(@RequestParam(required = false) String name,
                                                                @RequestParam(required = false) String email) {
        List<Partenaire> partenaires = partenaireService.findAll().stream()
                .filter(p -> name == null || p.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(p -> email == null || p.getEmail().toLowerCase().contains(email.toLowerCase()))
                .toList();
        return ResponseEntity.ok(partenaires);
    }

    @GetMapping("/{id}/funds")
    public ResponseEntity<List<PartenaireFond>> getPartenaireFunds(@PathVariable Long id) {
        Partenaire partenaire = partenaireService.findById(id);
        if (partenaire == null) {
            return ResponseEntity.notFound().build();
        }
        // Get funds through service query
        List<PartenaireFond> funds = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getPartenaire().getIdPartenaire().equals(id))
                .toList();
        return ResponseEntity.ok(funds);
    }

    @GetMapping("/statistics")
    public ResponseEntity<PartenaireStatistics> getPartenaireStatistics() {
        List<Partenaire> allPartenaires = partenaireService.findAll();
        
        long totalPartenaires = allPartenaires.size();
        long activePartenaires = allPartenaires.stream().filter(p -> p.getStatus() == Partenaire.PartnerStatus.ACTIVE).count();
        long inactivePartenaires = allPartenaires.stream().filter(p -> p.getStatus() == Partenaire.PartnerStatus.INACTIVE).count();
        long pendingPartenaires = allPartenaires.stream().filter(p -> p.getStatus() == Partenaire.PartnerStatus.PENDING_APPROVAL).count();
        
        long banks = allPartenaires.stream().filter(p -> p.getType() == Partenaire.PartnerType.BANK).count();
        long microfinance = allPartenaires.stream().filter(p -> p.getType() == Partenaire.PartnerType.MICROFINANCE).count();
        long governmentAgencies = allPartenaires.stream().filter(p -> p.getType() == Partenaire.PartnerType.GOVERNMENT_AGENCY).count();
        long ngos = allPartenaires.stream().filter(p -> p.getType() == Partenaire.PartnerType.NGO).count();
        long privateInvestors = allPartenaires.stream().filter(p -> p.getType() == Partenaire.PartnerType.PRIVATE_INVESTOR).count();
        
        PartenaireStatistics stats = new PartenaireStatistics(
                totalPartenaires, activePartenaires, inactivePartenaires, pendingPartenaires,
                banks, microfinance, governmentAgencies, ngos, privateInvestors
        );
        
        return ResponseEntity.ok(stats);
    }

    // Inner class for statistics
    public record PartenaireStatistics(
            long totalPartenaires,
            long activePartenaires,
            long inactivePartenaires,
            long pendingPartenaires,
            long banks,
            long microfinance,
            long governmentAgencies,
            long ngos,
            long privateInvestors
    ) {}

    @GetMapping("/top-contributors")
    public ResponseEntity<List<PartenaireContribution>> getTopContributors(@RequestParam(defaultValue = "10") int limit) {
        List<Partenaire> allPartenaires = partenaireService.findAll();
        
        List<PartenaireContribution> contributions = allPartenaires.stream()
                .map(p -> {
                    List<PartenaireFond> funds = partenaireFondService.findAll().stream()
                            .filter(pf -> pf.getPartenaire().getIdPartenaire().equals(p.getIdPartenaire()))
                            .toList();
                    
                    double totalCommitted = funds.stream().mapToDouble(PartenaireFond::getCommittedAmount).sum();
                    long fundCount = funds.size();
                    
                    return new PartenaireContribution(
                            p.getIdPartenaire(),
                            p.getName(),
                            p.getType().name(),
                            totalCommitted,
                            fundCount
                    );
                })
                .sorted((c1, c2) -> Double.compare(c2.totalCommitted(), c1.totalCommitted()))
                .limit(limit)
                .toList();
        
        return ResponseEntity.ok(contributions);
    }

    @GetMapping("/{id}/commitment-summary")
    public ResponseEntity<PartenaireCommitmentSummary> getCommitmentSummary(@PathVariable Long id) {
        Partenaire partenaire = partenaireService.findById(id);
        if (partenaire == null) {
            return ResponseEntity.notFound().build();
        }

        List<PartenaireFond> commitments = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getPartenaire().getIdPartenaire().equals(id))
                .toList();

        double totalCommitted = commitments.stream().mapToDouble(PartenaireFond::getCommittedAmount).sum();
        double totalPaid = commitments.stream()
                .filter(pf -> pf.getPaymentAmount() != null)
                .mapToDouble(PartenaireFond::getPaymentAmount)
                .sum();
        double totalPending = commitments.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("COMMITTED") || 
                             pf.getCommitmentStatus().name().equals("ACTIVE"))
                .mapToDouble(PartenaireFond::getCommittedAmount)
                .sum();
        double totalDefaulted = commitments.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("DEFAULTED"))
                .mapToDouble(PartenaireFond::getCommittedAmount)
                .sum();

        long activeFunds = commitments.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("COMMITTED") || 
                             pf.getCommitmentStatus().name().equals("ACTIVE"))
                .count();

        PartenaireCommitmentSummary summary = new PartenaireCommitmentSummary(
                partenaire.getIdPartenaire(),
                partenaire.getName(),
                totalCommitted,
                totalPaid,
                totalPending,
                totalDefaulted,
                commitments.size(),
                activeFunds
        );

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/inactive-partners")
    public ResponseEntity<List<Partenaire>> getInactivePartners(@RequestParam(defaultValue = "90") int daysInactive) {
        // Partners with no commitments in the last X days
        List<Partenaire> inactive = partenaireService.findAll().stream()
                .filter(p -> {
                    List<PartenaireFond> recentCommitments = partenaireFondService.findAll().stream()
                            .filter(pf -> pf.getPartenaire().getIdPartenaire().equals(p.getIdPartenaire()))
                            .filter(pf -> pf.getCommitmentDate() != null)
                            .filter(pf -> pf.getCommitmentDate().isAfter(
                                    java.time.LocalDate.now().minusDays(daysInactive)))
                            .toList();
                    return recentCommitments.isEmpty();
                })
                .toList();
        
        return ResponseEntity.ok(inactive);
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<Partenaire> activatePartenaire(@PathVariable Long id) {
        Partenaire partenaire = partenaireService.findById(id);
        if (partenaire == null) {
            return ResponseEntity.notFound().build();
        }
        partenaire.setStatus(Partenaire.PartnerStatus.ACTIVE);
        Partenaire updated = partenaireService.save(partenaire);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Partenaire> deactivatePartenaire(@PathVariable Long id) {
        Partenaire partenaire = partenaireService.findById(id);
        if (partenaire == null) {
            return ResponseEntity.notFound().build();
        }
        partenaire.setStatus(Partenaire.PartnerStatus.INACTIVE);
        Partenaire updated = partenaireService.save(partenaire);
        return ResponseEntity.ok(updated);
    }

    public record PartenaireContribution(
            Long partenaireId,
            String partenaireName,
            String type,
            double totalCommitted,
            long fundCount
    ) {}

    public record PartenaireCommitmentSummary(
            Long partenaireId,
            String partenaireName,
            double totalCommitted,
            double totalPaid,
            double totalPending,
            double totalDefaulted,
            long totalCommitments,
            long activeFunds
    ) {}
}