package tn.esprit.financia.ai;

import tn.esprit.financia.entities.formation.Course;

import java.util.List;

public interface RecommendationService {
    List<Course> recommendForCourse(long idCourse, int limit);
}
