package tn.esprit.financia.repository.formation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.financia.entities.formation.Lesson;

/**
 * Repository interface for Lesson entity.
 * Provides database access methods for lesson operations.
 */
@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
}
