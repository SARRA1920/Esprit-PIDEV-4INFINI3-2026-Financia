package tn.fiancia.financia.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.fiancia.financia.entities.Course;

/**
 * Repository interface for Course entity.
 * Provides database access methods for course operations.
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
}
