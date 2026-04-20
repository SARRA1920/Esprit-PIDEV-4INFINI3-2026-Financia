package tn.fiancia.financia.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.fiancia.financia.entities.LessonContent;

/**
 * Repository interface for LessonContent entity.
 * Provides database access methods for lesson content operations.
 */
@Repository
public interface LessonContentRepository extends JpaRepository<LessonContent, Long> {
}