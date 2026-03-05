package tn.esprit.financia.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.AllocationMetrics;
import tn.esprit.financia.dto.FundAllocationReport;
import tn.esprit.financia.service.IFundAllocationService;

@RestController
@AllArgsConstructor
@RequestMapping("/api/fonds")
public class FundAllocationController {

    private final IFundAllocationService fundAllocationService;

    @GetMapping("/{fondId}/allocation")
    public ResponseEntity<FundAllocationReport> generateAllocationReport(@PathVariable Long fondId) {
        FundAllocationReport report = fundAllocationService.generateReport(fondId);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/{fondId}/metrics")
    public ResponseEntity<AllocationMetrics> calculateMetrics(@PathVariable Long fondId) {
        AllocationMetrics metrics = fundAllocationService.calculateMetrics(fondId);
        return ResponseEntity.ok(metrics);
    }
}
