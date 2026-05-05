package tn.esprit.financia.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.financia.dto.RiskTrendResponse;
import tn.esprit.financia.service.StatsService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
@Tag(name = "Statistics", description = "Statistiques de securite")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @Operation(summary = "Risk score moyen par periode", description = "Retourne le risque moyen journalier entre from et to")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/security/risk-trend")
    public ResponseEntity<List<RiskTrendResponse>> getRiskTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(statsService.getDailyRiskTrend(from, to));
    }
}
