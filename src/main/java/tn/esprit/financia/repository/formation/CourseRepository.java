package tn.esprit.financia.repository.formation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.financia.entities.formation.Course;

/**
 * Repository interface for Course entity.
 * Provides database access methods for course operations.
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
}
