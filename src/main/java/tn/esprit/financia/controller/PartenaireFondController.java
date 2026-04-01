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

    @GetMapping("/fond/{fondId}")
    public ResponseEntity<List<PartenaireFond>> getPartenaireFondsByFond(@PathVariable Long fondId) {
        Fond fond = fondService.findById(fondId);
        if (fond == null) {
            return ResponseEntity.notFound().build();
        }
        List<PartenaireFond> partenaireFonds = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getFond().getIdFond().equals(fondId))
                .toList();
        return ResponseEntity.ok(partenaireFonds);
    }

    @GetMapping("/partenaire/{partenaireId}")
    public ResponseEntity<List<PartenaireFond>> getPartenaireFondsByPartenaire(@PathVariable Long partenaireId) {
        Partenaire partenaire = partenaireService.findById(partenaireId);
        if (partenaire == null) {
            return ResponseEntity.notFound().build();
        }
        List<PartenaireFond> partenaireFonds = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getPartenaire().getIdPartenaire().equals(partenaireId))
                .toList();
        return ResponseEntity.ok(partenaireFonds);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PartenaireFond>> getPartenaireFondsByStatus(@PathVariable String status) {
        List<PartenaireFond> partenaireFonds = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals(status))
                .toList();
        return ResponseEntity.ok(partenaireFonds);
    }

    @GetMapping("/committed")
    public ResponseEntity<List<PartenaireFond>> getCommittedPartenaireFonds() {
        List<PartenaireFond> partenaireFonds = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("COMMITTED"))
                .toList();
        return ResponseEntity.ok(partenaireFonds);
    }

    @GetMapping("/paid")
    public ResponseEntity<List<PartenaireFond>> getPaidPartenaireFonds() {
        List<PartenaireFond> partenaireFonds = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("PAID"))
                .toList();
        return ResponseEntity.ok(partenaireFonds);
    }

    @GetMapping("/defaulted")
    public ResponseEntity<List<PartenaireFond>> getDefaultedPartenaireFonds() {
        List<PartenaireFond> partenaireFonds = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("DEFAULTED"))
                .toList();
        return ResponseEntity.ok(partenaireFonds);
    }

    @GetMapping("/statistics")
    public ResponseEntity<PartenaireFondStatistics> getPartenaireFondStatistics() {
        List<PartenaireFond> all = partenaireFondService.findAll();
        
        long totalCommitments = all.size();
        long committedCount = all.stream().filter(pf -> pf.getCommitmentStatus().name().equals("COMMITTED")).count();
        long paidCount = all.stream().filter(pf -> pf.getCommitmentStatus().name().equals("PAID")).count();
        long defaultedCount = all.stream().filter(pf -> pf.getCommitmentStatus().name().equals("DEFAULTED")).count();
        
        double totalCommittedAmount = all.stream().mapToDouble(PartenaireFond::getCommittedAmount).sum();
        double totalPaidAmount = all.stream()
                .filter(pf -> pf.getPaymentAmount() != null)
                .mapToDouble(PartenaireFond::getPaymentAmount)
                .sum();
        double totalDefaultedAmount = all.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("DEFAULTED"))
                .mapToDouble(PartenaireFond::getCommittedAmount)
                .sum();
        
        PartenaireFondStatistics stats = new PartenaireFondStatistics(
                totalCommitments, committedCount, paidCount, defaultedCount,
                totalCommittedAmount, totalPaidAmount, totalDefaultedAmount
        );
        
        return ResponseEntity.ok(stats);
    }

    // Inner class for statistics
    public record PartenaireFondStatistics(
            long totalCommitments,
            long committedCount,
            long paidCount,
            long defaultedCount,
            double totalCommittedAmount,
            double totalPaidAmount,
            double totalDefaultedAmount
    ) {}

    @GetMapping("/pending-payments")
    public ResponseEntity<List<PartenaireFond>> getPendingPayments() {
        List<PartenaireFond> pending = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("COMMITTED") || 
                             pf.getCommitmentStatus().name().equals("ACTIVE"))
                .filter(pf -> pf.getPaymentDate() == null)
                .toList();
        return ResponseEntity.ok(pending);
    }

    @GetMapping("/overdue-payments")
    public ResponseEntity<List<PartenaireFond>> getOverduePayments(@RequestParam(defaultValue = "30") int daysOverdue) {
        java.time.LocalDate cutoffDate = java.time.LocalDate.now().minusDays(daysOverdue);
        
        List<PartenaireFond> overdue = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("COMMITTED") || 
                             pf.getCommitmentStatus().name().equals("ACTIVE"))
                .filter(pf -> pf.getCommitmentDate() != null)
                .filter(pf -> pf.getCommitmentDate().isBefore(cutoffDate))
                .filter(pf -> pf.getPaymentDate() == null)
                .toList();
        
        return ResponseEntity.ok(overdue);
    }

    @GetMapping("/recent-payments")
    public ResponseEntity<List<PartenaireFond>> getRecentPayments(@RequestParam(defaultValue = "30") int days) {
        java.time.LocalDate cutoffDate = java.time.LocalDate.now().minusDays(days);
        
        List<PartenaireFond> recent = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("PAID"))
                .filter(pf -> pf.getPaymentDate() != null)
                .filter(pf -> pf.getPaymentDate().isAfter(cutoffDate))
                .sorted((pf1, pf2) -> pf2.getPaymentDate().compareTo(pf1.getPaymentDate()))
                .toList();
        
        return ResponseEntity.ok(recent);
    }

    @GetMapping("/by-date-range")
    public ResponseEntity<List<PartenaireFond>> getCommitmentsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        
        java.time.LocalDate start = java.time.LocalDate.parse(startDate);
        java.time.LocalDate end = java.time.LocalDate.parse(endDate);
        
        List<PartenaireFond> commitments = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getCommitmentDate() != null)
                .filter(pf -> !pf.getCommitmentDate().isBefore(start))
                .filter(pf -> !pf.getCommitmentDate().isAfter(end))
                .toList();
        
        return ResponseEntity.ok(commitments);
    }

    @GetMapping("/payment-summary")
    public ResponseEntity<PaymentSummary> getPaymentSummary() {
        List<PartenaireFond> all = partenaireFondService.findAll();
        
        long totalCommitments = all.size();
        long pendingPayments = all.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("COMMITTED") || 
                             pf.getCommitmentStatus().name().equals("ACTIVE"))
                .count();
        long completedPayments = all.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("PAID"))
                .count();
        long defaultedPayments = all.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("DEFAULTED"))
                .count();
        
        double pendingAmount = all.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("COMMITTED") || 
                             pf.getCommitmentStatus().name().equals("ACTIVE"))
                .mapToDouble(PartenaireFond::getCommittedAmount)
                .sum();
        
        double completedAmount = all.stream()
                .filter(pf -> pf.getPaymentAmount() != null)
                .mapToDouble(PartenaireFond::getPaymentAmount)
                .sum();
        
        double defaultedAmount = all.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("DEFAULTED"))
                .mapToDouble(PartenaireFond::getCommittedAmount)
                .sum();
        
        double paymentRate = totalCommitments > 0 ? 
                (completedPayments * 100.0 / totalCommitments) : 0.0;
        double defaultRate = totalCommitments > 0 ? 
                (defaultedPayments * 100.0 / totalCommitments) : 0.0;
        
        PaymentSummary summary = new PaymentSummary(
                totalCommitments,
                pendingPayments,
                completedPayments,
                defaultedPayments,
                pendingAmount,
                completedAmount,
                defaultedAmount,
                paymentRate,
                defaultRate
        );
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<CommitmentTimeline> getCommitmentTimeline(@PathVariable Long id) {
        PartenaireFond pf = partenaireFondService.findById(id);
        if (pf == null) {
            return ResponseEntity.notFound().build();
        }
        
        CommitmentTimeline timeline = new CommitmentTimeline(
                pf.getId(),
                pf.getPartenaire().getName(),
                pf.getFond().getName(),
                pf.getCommittedAmount(),
                pf.getCommitmentDate(),
                pf.getPaymentDate(),
                pf.getDefaultDate(),
                pf.getCommitmentStatus().name(),
                calculateDaysSinceCommitment(pf),
                calculateDaysToPayment(pf)
        );
        
        return ResponseEntity.ok(timeline);
    }

    private long calculateDaysSinceCommitment(PartenaireFond pf) {
        if (pf.getCommitmentDate() == null) return 0;
        return java.time.temporal.ChronoUnit.DAYS.between(
                pf.getCommitmentDate(), 
                java.time.LocalDate.now()
        );
    }

    private Long calculateDaysToPayment(PartenaireFond pf) {
        if (pf.getCommitmentDate() == null || pf.getPaymentDate() == null) return null;
        return java.time.temporal.ChronoUnit.DAYS.between(
                pf.getCommitmentDate(), 
                pf.getPaymentDate()
        );
    }

    public record PaymentSummary(
            long totalCommitments,
            long pendingPayments,
            long completedPayments,
            long defaultedPayments,
            double pendingAmount,
            double completedAmount,
            double defaultedAmount,
            double paymentRate,
            double defaultRate
    ) {}

    public record CommitmentTimeline(
            Long commitmentId,
            String partnerName,
            String fundName,
            double committedAmount,
            java.time.LocalDate commitmentDate,
            java.time.LocalDate paymentDate,
            java.time.LocalDate defaultDate,
            String currentStatus,
            long daysSinceCommitment,
            Long daysToPayment
    ) {}
}