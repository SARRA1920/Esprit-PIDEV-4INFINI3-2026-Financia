package tn.esprit.financia.controller.formation;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.ai.RecommendationService;
import tn.esprit.financia.entities.formation.Course;

import java.util.List;

@RestController
@RequestMapping("/recommendation")
@CrossOrigin(origins = "*")
@AllArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * Get course recommendations based on a similar course.
     * Finds courses with similar content to the specified course.
     * 
     * @param id    the course ID to find similar courses for
     * @param limit maximum number of recommendations (default: 10)
     * @return list of recommended courses
     */
    @GetMapping("/getRecommendations/{id}")
    public List<Course> getRecommendations(@PathVariable("id") long id,
                                           @RequestParam(value = "limit", required = false, defaultValue = "10") int limit) {
        return recommendationService.recommendForCourse(id, limit);
    }

    /**
     * Get course recommendations based on user's project goal.
     * Finds courses that align with the user's specified project goal or career objective.
     * 
     * @param userId the user ID whose project goal will be used for recommendations
     * @param limit  maximum number of recommendations (default: 10)
     * @return list of recommended courses matching the user's project goal
     */
    @GetMapping("/getRecommendationsByGoal/{userId}")
    public List<Course> getRecommendationsByGoal(@PathVariable("userId") long userId,
                                                 @RequestParam(value = "limit", required = false, defaultValue = "10") int limit) {
        return recommendationService.recommendForProjectGoal(userId, limit);
    }
}
