package tn.fiancia.financia.services;

import tn.fiancia.financia.entities.Course;

import java.util.List;

/**
 * Service interface for Course entity operations.
 * Defines contract for course management functionality.
 */
public interface ICourseService {

    /**
     * Creates a new course.
     *
     * @param course the course to create
     * @return the created course
     * @throws tn.fiancia.financia.exception.ValidationException if course data is invalid
     */
    Course addCourse(Course course);

    /**
     * Updates an existing course.
     *
     * @param course the course with updated data
     * @return the updated course
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if course not found
     * @throws tn.fiancia.financia.exception.ValidationException if course data is invalid
     */
    Course updateCourse(Course course);

    /**
     * Retrieves a course by ID.
     *
     * @param courseId the course ID
     * @return the course if found
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if course not found
     */
    Course getCourse(long courseId);

    /**
     * Deletes a course by ID.
     *
     * @param courseId the course ID
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if course not found
     */
    void deleteCourse(long courseId);

    /**
     * Retrieves all courses.
     *
     * @return list of all courses
     */
    List<Course> getAllCourses();

    /**
     * Creates multiple courses in batch.
     *
     * @param courses the list of courses to create
     * @return the list of created courses
     * @throws tn.fiancia.financia.exception.ValidationException if any course data is invalid
     */
    List<Course> addAllCourses(List<Course> courses);
}

