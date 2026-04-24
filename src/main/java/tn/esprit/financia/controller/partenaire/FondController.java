package tn.esprit.financia.controller.partenaire;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.partenaire.Fond;
import tn.esprit.financia.entities.partenaire.PartenaireFond;
import tn.esprit.financia.service.partenaire.IFondService;
import tn.esprit.financia.service.partenaire.IPartenaireFondService;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/fonds")
public class FondController {

    private final IFondService fondService;
    private final IPartenaireFondService partenaireFondService;

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

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Fond>> getFondsByStatus(@PathVariable String status) {
        List<Fond> fonds = fondService.findAll().stream()
                .filter(f -> f.getStatus().name().equals(status))
                .toList();
        return ResponseEntity.ok(fonds);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Fond>> getAvailableFonds() {
        List<Fond> fonds = fondService.findAll().stream()
                .filter(f -> f.getStatus() == Fond.FundStatus.AVAILABLE)
                .toList();
        return ResponseEntity.ok(fonds);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Fond>> searchFonds(@RequestParam(required = false) String name,
                                                    @RequestParam(required = false) Double minAmount,
                                                    @RequestParam(required = false) Double maxAmount) {
        List<Fond> fonds = fondService.findAll().stream()
                .filter(f -> name == null || f.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(f -> minAmount == null || f.getAmount() >= minAmount)
                .filter(f -> maxAmount == null || f.getAmount() <= maxAmount)
                .toList();
        return ResponseEntity.ok(fonds);
    }

    @GetMapping("/{id}/partners")
    public ResponseEntity<List<PartenaireFond>> getFondPartners(@PathVariable Long id) {
        Fond fond = fondService.findById(id);
        if (fond == null) {
            return ResponseEntity.notFound().build();
        }
        // Get partners through service query
        List<PartenaireFond> partners = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getFond().getIdFond().equals(id))
                .toList();
        return ResponseEntity.ok(partners);
    }

    @GetMapping("/statistics")
    public ResponseEntity<FondStatistics> getFondStatistics() {
        List<Fond> allFonds = fondService.findAll();
        
        long totalFonds = allFonds.size();
        long availableFonds = allFonds.stream().filter(f -> f.getStatus() == Fond.FundStatus.AVAILABLE).count();
        long fullyAllocatedFonds = allFonds.stream().filter(f -> f.getStatus() == Fond.FundStatus.FULLY_ALLOCATED).count();
        long closedFonds = allFonds.stream().filter(f -> f.getStatus() == Fond.FundStatus.CLOSED).count();
        
        double totalAmount = allFonds.stream().mapToDouble(Fond::getAmount).sum();
        double totalCommitted = allFonds.stream().mapToDouble(Fond::getCommittedAmount).sum();
        double totalRemaining = totalAmount - totalCommitted;
        
        FondStatistics stats = new FondStatistics(
                totalFonds, availableFonds, fullyAllocatedFonds, closedFonds,
                totalAmount, totalCommitted, totalRemaining
        );
        
        return ResponseEntity.ok(stats);
    }

    // Inner class for statistics
    public record FondStatistics(
            long totalFonds,
            long availableFonds,
            long fullyAllocatedFonds,
            long closedFonds,
            double totalAmount,
            double totalCommitted,
            double totalRemaining
    ) {}

    @GetMapping("/top-allocated")
    public ResponseEntity<List<Fond>> getTopAllocatedFonds(@RequestParam(defaultValue = "5") int limit) {
        List<Fond> topFonds = fondService.findAll().stream()
                .sorted((f1, f2) -> Double.compare(f2.getCommittedAmount(), f1.getCommittedAmount()))
                .limit(limit)
                .toList();
        return ResponseEntity.ok(topFonds);
    }

    @GetMapping("/under-allocated")
    public ResponseEntity<List<Fond>> getUnderAllocatedFonds(@RequestParam(defaultValue = "50") double threshold) {
        List<Fond> underAllocated = fondService.findAll().stream()
                .filter(f -> f.getStatus() == Fond.FundStatus.AVAILABLE)
                .filter(f -> (f.getCommittedAmount() / f.getAmount() * 100) < threshold)
                .toList();
        return ResponseEntity.ok(underAllocated);
    }

    @GetMapping("/nearly-full")
    public ResponseEntity<List<Fond>> getNearlyFullFonds(@RequestParam(defaultValue = "90") double threshold) {
        List<Fond> nearlyFull = fondService.findAll().stream()
                .filter(f -> f.getStatus() == Fond.FundStatus.AVAILABLE)
                .filter(f -> (f.getCommittedAmount() / f.getAmount() * 100) >= threshold)
                .toList();
        return ResponseEntity.ok(nearlyFull);
    }

    @GetMapping("/{id}/utilization")
    public ResponseEntity<FondUtilization> getFondUtilization(@PathVariable Long id) {
        Fond fond = fondService.findById(id);
        if (fond == null) {
            return ResponseEntity.notFound().build();
        }

        List<PartenaireFond> commitments = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getFond().getIdFond().equals(id))
                .toList();

        long totalPartners = commitments.size();
        long activeCommitments = commitments.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("COMMITTED") || 
                             pf.getCommitmentStatus().name().equals("ACTIVE"))
                .count();
        long paidCommitments = commitments.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("PAID"))
                .count();
        long defaultedCommitments = commitments.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("DEFAULTED"))
                .count();

        double utilizationRate = (fond.getCommittedAmount() / fond.getAmount()) * 100;
        double remainingCapacity = fond.getAmount() - fond.getCommittedAmount();

        FondUtilization utilization = new FondUtilization(
                fond.getIdFond(),
                fond.getName(),
                fond.getAmount(),
                fond.getCommittedAmount(),
                remainingCapacity,
                utilizationRate,
                totalPartners,
                activeCommitments,
                paidCommitments,
                defaultedCommitments
        );

        return ResponseEntity.ok(utilization);
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Fond> closeFond(@PathVariable Long id) {
        Fond fond = fondService.findById(id);
        if (fond == null) {
            return ResponseEntity.notFound().build();
        }
        fond.setStatus(Fond.FundStatus.CLOSED);
        Fond updated = fondService.save(fond);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/reopen")
    public ResponseEntity<Fond> reopenFond(@PathVariable Long id) {
        Fond fond = fondService.findById(id);
        if (fond == null) {
            return ResponseEntity.notFound().build();
        }
        if (fond.getCommittedAmount() >= fond.getAmount()) {
            fond.setStatus(Fond.FundStatus.FULLY_ALLOCATED);
        } else {
            fond.setStatus(Fond.FundStatus.AVAILABLE);
        }
        Fond updated = fondService.save(fond);
        return ResponseEntity.ok(updated);
    }

    public record FondUtilization(
            Long fondId,
            String fondName,
            double totalAmount,
            double committedAmount,
            double remainingCapacity,
            double utilizationRate,
            long totalPartners,
            long activeCommitments,
            long paidCommitments,
            long defaultedCommitments
    ) {}
}