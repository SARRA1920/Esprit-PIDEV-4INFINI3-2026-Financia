package tn.esprit.financia.controller.formation;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.ai.RecommendationService;
import tn.esprit.financia.entities.formation.Course;

import java.util.List;

@RestController
@RequestMapping("/recommendation")
@AllArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/getRecommendations/{id}")
    public List<Course> getRecommendations(@PathVariable("id") long id,
                                           @RequestParam(value = "limit", required = false, defaultValue = "10") int limit) {
        return recommendationService.recommendForCourse(id, limit);
    }
}
