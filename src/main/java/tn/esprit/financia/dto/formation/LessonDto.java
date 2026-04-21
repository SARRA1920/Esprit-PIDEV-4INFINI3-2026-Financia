package tn.esprit.financia.dto.formation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.financia.entities.formation.LessonType;

/**
 * Data Transfer Object for Lesson entity.
 * Provides a clean API contract separate from the JPA entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDto {
    private Long lessonId;
    private String title;
    private LessonType type;
    private Integer orderIndex;
    private Long courseId;
    private LessonContentDto content;
}
