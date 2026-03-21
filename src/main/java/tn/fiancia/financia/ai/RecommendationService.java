package tn.fiancia.financia.ai;

import tn.fiancia.financia.entities.Course;

import java.util.List;

public interface RecommendationService {
    List<Course> recommendForCourse(long idCourse, int limit);
}
