package tn.esprit.financia.repository.formation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.financia.entities.formation.LessonContent;

/**
 * Repository interface for LessonContent entity.
 * Provides database access methods for lesson content operations.
 */
@Repository
public interface LessonContentRepository extends JpaRepository<LessonContent, Long> {
}