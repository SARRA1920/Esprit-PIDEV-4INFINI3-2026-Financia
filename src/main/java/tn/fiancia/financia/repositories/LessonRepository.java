package tn.fiancia.financia.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.fiancia.financia.entities.Lesson;

/**
 * Repository interface for Lesson entity.
 * Provides database access methods for lesson operations.
 */
@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
}
