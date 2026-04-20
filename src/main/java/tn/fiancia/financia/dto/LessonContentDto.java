package tn.fiancia.financia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for LessonContent entity.
 * Separates the API layer from the persistence layer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonContentDto {
    private Long lessonContentId;
    private Long lessonId;
    private String textContent;
    private String fileUrl;
    private String quizJson;
    private String textEnglish;
    private String textFrench;
    private String textArabic;
}
