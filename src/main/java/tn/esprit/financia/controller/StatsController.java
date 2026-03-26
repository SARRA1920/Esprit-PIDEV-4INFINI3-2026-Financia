package tn.esprit.financia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.financia.dto.PortfolioHealthStatsDto;
import tn.esprit.financia.service.CreditStatsService;

@RestController
@RequestMapping("/api/stats/credits")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StatsController {

    private final CreditStatsService creditStatsService;

    @GetMapping("/portfolio")
    public ResponseEntity<PortfolioHealthStatsDto> getPortfolioHealth() {
        return ResponseEntity.ok(creditStatsService.getPortfolioHealthStats());
    }
}

