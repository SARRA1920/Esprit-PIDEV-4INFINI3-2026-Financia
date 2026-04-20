package tn.fiancia.financia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object for Course entity.
 * Used for API requests and responses to separate domain entities from API contracts.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDto {
    private Long courseId;
    private String title;
    private String description;
    private List<LessonDto> lessons;
}
