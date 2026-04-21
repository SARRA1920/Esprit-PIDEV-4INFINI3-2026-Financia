package tn.esprit.financia.service.formation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.formation.Course;
import tn.esprit.financia.entities.formation.Lesson;
import tn.esprit.financia.exception.ResourceNotFoundException;
import tn.esprit.financia.repository.formation.CourseRepository;
import tn.esprit.financia.repository.formation.LessonRepository;
import tn.esprit.financia.service.formation.base.BaseService;
import tn.esprit.financia.validator.ValidationUtils;

import java.util.List;

/**
 * Service implementation for Lesson entity operations.
 * Provides business logic for lesson management with validation and error handling.
 */
@Service
@Slf4j
public class LessonServiceImpl extends BaseService<Lesson, Long, LessonRepository> implements ILessonService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    public LessonServiceImpl(LessonRepository lessonRepository, CourseRepository courseRepository) {
        super(lessonRepository, "Lesson");
        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public Lesson addLesson(Lesson lesson, long courseId) {
        log.info("Creating lesson with title: {} for course ID: {}", lesson.getTitle(), courseId);
        
        // Validate inputs
        ValidationUtils.validatePositiveId(courseId, "Course ID");
        ValidationUtils.validateLessonTitle(lesson.getTitle());

        // Verify course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "courseId", courseId));

        lesson.setCourse(course);
        Lesson savedLesson = lessonRepository.save(lesson);
        
        log.info("Lesson created successfully with ID: {} for course: {}", 
                savedLesson.getIdLesson(), courseId);
        
        return savedLesson;
    }

    @Override
    public Lesson updateLesson(Lesson lesson) {
        if (lesson.getIdLesson() == null || lesson.getIdLesson() <= 0) {
            log.warn("Invalid lesson ID for update: {}", lesson.getIdLesson());
            throw new IllegalArgumentException("Lesson ID must be provided for update");
        }

        log.info("Updating lesson with ID: {}", lesson.getIdLesson());
        
        // Validate inputs
        ValidationUtils.validateLessonTitle(lesson.getTitle());

        // Verify lesson exists
        Lesson existingLesson = findByIdOrThrow(lesson.getIdLesson());

        // Preserve course reference if not provided
        if (lesson.getCourse() == null) {
            lesson.setCourse(existingLesson.getCourse());
        }

        Lesson updatedLesson = lessonRepository.save(lesson);
        
        log.info("Lesson updated successfully with ID: {}", updatedLesson.getIdLesson());
        
        return updatedLesson;
    }

    @Override
    public Lesson getLesson(long lessonId) {
        log.debug("Fetching lesson with ID: {}", lessonId);
        
        if (lessonId <= 0) {
            throw new IllegalArgumentException("Lesson ID must be positive");
        }

        Lesson lesson = findByIdOrThrow(lessonId);
        log.debug("Lesson found with ID: {}", lessonId);
        
        return lesson;
    }

    @Override
    public void deleteLesson(long lessonId) {
        log.info("Deleting lesson with ID: {}", lessonId);
        
        if (lessonId <= 0) {
            throw new IllegalArgumentException("Lesson ID must be positive");
        }

        // Verify lesson exists
        findByIdOrThrow(lessonId);
        
        lessonRepository.deleteById(lessonId);
        log.info("Lesson deleted successfully with ID: {}", lessonId);
    }

    @Override
    public List<Lesson> getAllLessons() {
        log.debug("Fetching all lessons");
        List<Lesson> lessons = lessonRepository.findAll();
        log.debug("Retrieved {} lessons", lessons.size());
        
        return lessons;
    }

    @Override
    public List<Lesson> addAllLessons(List<Lesson> lessons, long courseId) {
        if (lessons == null || lessons.isEmpty()) {
            log.warn("Attempted to add empty lesson list");
            throw new IllegalArgumentException("Lesson list cannot be empty");
        }

        log.info("Creating {} lessons in batch for course ID: {}", lessons.size(), courseId);
        
        // Validate inputs
        ValidationUtils.validatePositiveId(courseId, "Course ID");

        // Verify course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "courseId", courseId));

        // Validate all lessons
        for (Lesson lesson : lessons) {
            ValidationUtils.validateLessonTitle(lesson.getTitle());
            lesson.setCourse(course);
        }

        List<Lesson> savedLessons = lessonRepository.saveAll(lessons);
        log.info("Batch created {} lessons successfully for course: {}", savedLessons.size(), courseId);
        
        return savedLessons;
    }
}


