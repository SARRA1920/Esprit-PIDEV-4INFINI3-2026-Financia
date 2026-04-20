package tn.fiancia.financia.controllers;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.fiancia.financia.dto.ApiResponse;
import tn.fiancia.financia.dto.CourseDto;
import tn.fiancia.financia.entities.Course;
import tn.fiancia.financia.services.ICourseService;
import tn.fiancia.financia.util.AppConstants;
import tn.fiancia.financia.util.EntityDtoMapper;

import java.util.List;

/**
 * REST controller for Course management.
 * Handles HTTP requests for course operations.
 */
@RestController
@RequestMapping(AppConstants.COURSES_ENDPOINT)
@AllArgsConstructor
@Slf4j
public class CourseController {

    private final ICourseService courseService;

    /**
     * Creates a new course.
     *
     * @param courseDto the course data
     * @return response with created course
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CourseDto>> addCourse(@RequestBody CourseDto courseDto) {
        log.info("Received request to create course with title: {}", courseDto.getTitle());
        
        try {
            Course course = EntityDtoMapper.toEntity(courseDto);
            Course createdCourse = courseService.addCourse(course);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            EntityDtoMapper.toDto(createdCourse),
                            "Course created successfully"));
        } catch (Exception e) {
            log.error("Error creating course", e);
            throw e;
        }
    }

    /**
     * Updates an existing course.
     *
     * @param courseDto the course data with updates
     * @return response with updated course
     */
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourse(@RequestBody CourseDto courseDto) {
        log.info("Received request to update course with ID: {}", courseDto.getCourseId());
        
        try {
            Course course = EntityDtoMapper.toEntity(courseDto);
            Course updatedCourse = courseService.updateCourse(course);
            
            return ResponseEntity.ok(ApiResponse.success(
                    EntityDtoMapper.toDto(updatedCourse),
                    "Course updated successfully"));
        } catch (Exception e) {
            log.error("Error updating course", e);
            throw e;
        }
    }

    /**
     * Retrieves a course by ID.
     *
     * @param courseId the course ID
     * @return response with the course
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseDto>> getCourse(@PathVariable Long courseId) {
        log.info("Received request to get course with ID: {}", courseId);
        
        try {
            Course course = courseService.getCourse(courseId);
            return ResponseEntity.ok(ApiResponse.success(
                    EntityDtoMapper.toDto(course),
                    "Course retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving course", e);
            throw e;
        }
    }

    /**
     * Deletes a course by ID.
     *
     * @param courseId the course ID
     * @return response indicating successful deletion
     */
    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long courseId) {
        log.info("Received request to delete course with ID: {}", courseId);
        
        try {
            courseService.deleteCourse(courseId);
            return ResponseEntity.ok(ApiResponse.success(null, "Course deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting course", e);
            throw e;
        }
    }

    /**
     * Retrieves all courses.
     *
     * @return response with list of all courses
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDto>>> getAllCourses() {
        log.info("Received request to get all courses");
        
        try {
            List<Course> courses = courseService.getAllCourses();
            return ResponseEntity.ok(ApiResponse.success(
                    EntityDtoMapper.toDtoList(courses),
                    "Courses retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving courses", e);
            throw e;
        }
    }

    /**
     * Creates multiple courses in batch.
     *
     * @param courseDtos list of course data
     * @return response with list of created courses
     */
    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<CourseDto>>> addAllCourses(@RequestBody List<CourseDto> courseDtos) {
        log.info("Received request to create {} courses in batch", courseDtos.size());
        
        try {
            List<Course> courses = courseDtos.stream()
                    .map(EntityDtoMapper::toEntity)
                    .toList();
            List<Course> createdCourses = courseService.addAllCourses(courses);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            EntityDtoMapper.toDtoList(createdCourses),
                            "Courses created successfully"));
        } catch (Exception e) {
            log.error("Error creating courses in batch", e);
            throw e;
        }
    }
}
