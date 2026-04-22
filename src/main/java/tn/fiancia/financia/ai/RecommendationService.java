package tn.fiancia.financia.ai;

import tn.fiancia.financia.entities.Course;

import java.util.List;

public interface RecommendationService {
    /**
     * Recommends courses based on similarity to a given course.
     * Uses content-based filtering to find courses with similar titles and descriptions.
     * 
     * @param idCourse the course ID to find similar courses for
     * @param limit    maximum number of recommendations to return
     * @return list of recommended courses
     */
    List<Course> recommendForCourse(long idCourse, int limit);

    /**
     * Recommends courses based on a user's project goal.
     * Searches for courses that align with the user's career objective or project aspirations.
     * 
     * @param userId   the user ID
     * @param limit    maximum number of recommendations to return
     * @return list of recommended courses matching the user's project goal
     */
    List<Course> recommendForProjectGoal(long userId, int limit);
}
