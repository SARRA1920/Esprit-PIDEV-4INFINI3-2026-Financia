package tn.esprit.financia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.AllocationRecommendation;
import tn.esprit.financia.service.AllocationRecommendationService;

import java.util.List;

@RestController
@RequestMapping("/api/allocation-recommendations")
@RequiredArgsConstructor
public class AllocationRecommendationController {

    private final AllocationRecommendationService recommendationService;

    /**
     * Get AI-powered allocation recommendations for a specific fond
     * Shows which partenaires should receive allocations and how much
     */
    @GetMapping("/fond/{fondId}")
    public ResponseEntity<AllocationRecommendation> getRecommendationsForFond(@PathVariable Long fondId) {
        AllocationRecommendation recommendations = recommendationService.getRecommendationsForFond(fondId);
        return ResponseEntity.ok(recommendations);
    }

    /**
     * Get recommendations for a specific partenaire across all fonds
     * Shows which fonds are best suited for this partenaire
     */
    @GetMapping("/partenaire/{partenaireId}")
    public ResponseEntity<List<AllocationRecommendation>> getRecommendationsForPartenaire(
            @PathVariable Long partenaireId) {
        List<AllocationRecommendation> recommendations = 
                recommendationService.getRecommendationsForPartenaire(partenaireId);
        return ResponseEntity.ok(recommendations);
    }
}
