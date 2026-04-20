package tn.fiancia.financia.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.fiancia.financia.entities.Course;
import tn.fiancia.financia.exception.ResourceNotFoundException;
import tn.fiancia.financia.repositories.CourseRepository;
import tn.fiancia.financia.services.base.BaseService;
import tn.fiancia.financia.validator.ValidationUtils;

import java.util.List;

/**
 * Service implementation for Course entity operations.
 * Provides business logic for course management with validation and error handling.
 */
@Service
@Slf4j
public class CourseServiceImpl extends BaseService<Course, Long, CourseRepository> implements ICourseService {

    private final CourseRepository courseRepository;

    public CourseServiceImpl(CourseRepository courseRepository) {
        super(courseRepository, "Course");
        this.courseRepository = courseRepository;
    }

    @Override
    public Course addCourse(Course course) {
        log.info("Creating new course with title: {}", course.getTitle());
        
        // Validate course data
        ValidationUtils.validateCourseTitle(course.getTitle());
        if (course.getDescription() != null) {
            ValidationUtils.validateCourseDescription(course.getDescription());
        }

        Course savedCourse = courseRepository.save(course);
        log.info("Course created successfully with ID: {}", savedCourse.getIdCourse());
        
        return savedCourse;
    }

    @Override
    public Course updateCourse(Course course) {
        if (course.getIdCourse() <= 0) {
            log.warn("Invalid course ID for update: {}", course.getIdCourse());
            throw new IllegalArgumentException("Course ID must be provided for update");
        }

        log.info("Updating course with ID: {}", course.getIdCourse());
        
        // Verify course exists
        findByIdOrThrow(course.getIdCourse());

        // Validate course data
        ValidationUtils.validateCourseTitle(course.getTitle());
        if (course.getDescription() != null) {
            ValidationUtils.validateCourseDescription(course.getDescription());
        }

        Course updatedCourse = courseRepository.save(course);
        log.info("Course updated successfully with ID: {}", updatedCourse.getIdCourse());
        
        return updatedCourse;
    }

    @Override
    public Course getCourse(long courseId) {
        log.debug("Fetching course with ID: {}", courseId);
        
        if (courseId <= 0) {
            throw new IllegalArgumentException("Course ID must be positive");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "courseId", courseId));
        
        log.debug("Course found with ID: {}", courseId);
        return course;
    }

    @Override
    public void deleteCourse(long courseId) {
        log.info("Deleting course with ID: {}", courseId);
        
        if (courseId <= 0) {
            throw new IllegalArgumentException("Course ID must be positive");
        }

        // Verify course exists before deletion
        findByIdOrThrow(courseId);
        
        courseRepository.deleteById(courseId);
        log.info("Course deleted successfully with ID: {}", courseId);
    }

    @Override
    public List<Course> getAllCourses() {
        log.debug("Fetching all courses");
        List<Course> courses = courseRepository.findAll();
        log.debug("Retrieved {} courses", courses.size());
        
        return courses;
    }

    @Override
    public List<Course> addAllCourses(List<Course> courses) {
        if (courses == null || courses.isEmpty()) {
            log.warn("Attempted to add empty course list");
            throw new IllegalArgumentException("Course list cannot be empty");
        }

        log.info("Creating {} courses in batch", courses.size());
        
        // Validate all courses
        for (Course course : courses) {
            ValidationUtils.validateCourseTitle(course.getTitle());
            if (course.getDescription() != null) {
                ValidationUtils.validateCourseDescription(course.getDescription());
            }
        }

        List<Course> savedCourses = courseRepository.saveAll(courses);
        log.info("Batch created {} courses successfully", savedCourses.size());
        
        return savedCourses;
    }
}

