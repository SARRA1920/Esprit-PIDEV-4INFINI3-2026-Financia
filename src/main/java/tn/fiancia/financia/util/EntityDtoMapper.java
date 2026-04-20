package tn.fiancia.financia.util;

import tn.fiancia.financia.dto.CourseDto;
import tn.fiancia.financia.dto.LessonContentDto;
import tn.fiancia.financia.dto.LessonDto;
import tn.fiancia.financia.dto.UserDto;
import tn.fiancia.financia.entities.Course;
import tn.fiancia.financia.entities.Lesson;
import tn.fiancia.financia.entities.LessonContent;
import tn.fiancia.financia.entities.User;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper utility for converting between entities and DTOs.
 * Provides a centralized location for conversion logic, making the codebase more maintainable.
 */
public class EntityDtoMapper {

    private EntityDtoMapper() {
        // Private constructor to prevent instantiation
    }

    // ========== User Mappings ==========

    /**
     * Converts a User entity to UserDto.
     */
    public static UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        Set<Long> courseIds = user.getCourses() != null
                ? user.getCourses().stream()
                .map(Course::getIdCourse)
                .collect(Collectors.toSet())
                : Collections.emptySet();

        return UserDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .courseIds(courseIds)
                .build();
    }

    /**
     * Converts a UserDto to User entity.
     * Note: userId is set to null for new entities to allow Hibernate to generate the ID.
     * For existing entities, userId should be provided in the DTO.
     */
    public static User toEntity(UserDto dto) {
        if (dto == null) {
            return null;
        }

        User user = new User();
        // Set userId to null if not provided or if it's 0 (new entity)
        user.setUserId(dto.getUserId() != null && dto.getUserId() > 0 ? dto.getUserId() : null);
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setRole(dto.getRole());
        user.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        
        return user;
    }

    /**
     * Converts a list of User entities to UserDto list.
     */
    public static List<UserDto> toDtoUserList(List<User> users) {
        if (users == null) {
            return Collections.emptyList();
        }
        return users.stream()
                .map(EntityDtoMapper::toDto)
                .collect(Collectors.toList());
    }

    // ========== Course Mappings ==========

    /**
     * Converts a Course entity to CourseDto.
     */
    public static CourseDto toDto(Course course) {
        if (course == null) {
            return null;
        }

        return CourseDto.builder()
                .courseId(course.getIdCourse())
                .title(course.getTitle())
                .description(course.getDescription())
                .lessons(course.getLessons() != null
                        ? course.getLessons().stream()
                        .map(EntityDtoMapper::toDto)
                        .collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }

    /**
     * Converts a CourseDto to Course entity.
     * Note: idCourse is set to null for new entities to allow Hibernate to generate the ID.
     * For existing entities, idCourse should be provided in the DTO.
     */
    public static Course toEntity(CourseDto dto) {
        if (dto == null) {
            return null;
        }

        Course course = new Course();
        // Set idCourse to null if not provided or if it's 0 (new entity)
        course.setIdCourse(dto.getCourseId() != null && dto.getCourseId() > 0 ? dto.getCourseId() : null);
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        return course;
    }

    /**
     * Converts a list of Course entities to CourseDto list.
     */
    public static List<CourseDto> toDtoList(List<Course> courses) {
        if (courses == null) {
            return Collections.emptyList();
        }
        return courses.stream()
                .map(EntityDtoMapper::toDto)
                .collect(Collectors.toList());
    }

    // ========== Lesson Mappings ==========

    /**
     * Converts a Lesson entity to LessonDto.
     */
    public static LessonDto toDto(Lesson lesson) {
        if (lesson == null) {
            return null;
        }

        return LessonDto.builder()
                .lessonId(lesson.getIdLesson())
                .title(lesson.getTitle())
                .type(lesson.getType())
                .orderIndex(lesson.getOrderIndex())
                .courseId(lesson.getCourse() != null ? lesson.getCourse().getIdCourse() : null)
                .content(toDto(lesson.getContent()))
                .build();
    }

    /**
     * Converts a LessonDto to Lesson entity.
     * Note: idLesson is set to null for new entities to allow Hibernate to generate the ID.
     * For existing entities, idLesson should be provided in the DTO.
     */
    public static Lesson toEntity(LessonDto dto) {
        if (dto == null) {
            return null;
        }

        Lesson lesson = new Lesson();
        // Set idLesson to null if not provided or if it's 0 (new entity)
        lesson.setIdLesson(dto.getLessonId() != null && dto.getLessonId() > 0 ? dto.getLessonId() : null);
        lesson.setTitle(dto.getTitle());
        lesson.setType(dto.getType());
        lesson.setOrderIndex(dto.getOrderIndex());
        return lesson;
    }

    /**
     * Converts a list of Lesson entities to LessonDto list.
     */
    public static List<LessonDto> toLessonDtoList(List<Lesson> lessons) {
        if (lessons == null) {
            return Collections.emptyList();
        }
        return lessons.stream()
                .map(EntityDtoMapper::toDto)
                .collect(Collectors.toList());
    }

    // ========== LessonContent Mappings ==========

    /**
     * Converts a LessonContent entity to LessonContentDto.
     */
    public static LessonContentDto toDto(LessonContent content) {
        if (content == null) {
            return null;
        }

        return LessonContentDto.builder()
                .lessonContentId(content.getIdLessonContent())
                .lessonId(content.getLesson() != null ? content.getLesson().getIdLesson() : null)
                .textContent(content.getTextContent())
                .fileUrl(content.getFileUrl())
                .quizJson(content.getQuizJson())
                .textEnglish(content.getTextEnglish())
                .textFrench(content.getTextFrench())
                .textArabic(content.getTextArabic())
                .build();
    }

    /**
     * Converts a LessonContentDto to LessonContent entity.
     * Note: idLessonContent is set to null for new entities to allow Hibernate to generate the ID.
     * For existing entities, idLessonContent should be provided in the DTO.
     */
    public static LessonContent toEntity(LessonContentDto dto) {
        if (dto == null) {
            return null;
        }

        LessonContent content = new LessonContent();
        // Set idLessonContent to null if not provided or if it's 0 (new entity)
        content.setIdLessonContent(dto.getLessonContentId() != null && dto.getLessonContentId() > 0 ? dto.getLessonContentId() : null);
        content.setTextContent(dto.getTextContent());
        content.setFileUrl(dto.getFileUrl());
        content.setQuizJson(dto.getQuizJson());
        content.setTextEnglish(dto.getTextEnglish());
        content.setTextFrench(dto.getTextFrench());
        content.setTextArabic(dto.getTextArabic());
        return content;
    }
}
