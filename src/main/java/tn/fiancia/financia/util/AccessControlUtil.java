package tn.fiancia.financia.util;

import org.springframework.stereotype.Component;
import tn.fiancia.financia.exception.ResourceNotFoundException;
import tn.fiancia.financia.repositories.CourseRepository;
import tn.fiancia.financia.repositories.LessonRepository;
import tn.fiancia.financia.repositories.UserRepository;
import tn.fiancia.financia.services.IUserService;

/**
 * Utility class for access control checks.
 * Provides methods to check if a user has access to courses, lessons, and content.
 * Used by the security layer for routing and authorization.
 */
@Component
public class AccessControlUtil {

    private final IUserService userService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    public AccessControlUtil(IUserService userService, UserRepository userRepository,
                             CourseRepository courseRepository, LessonRepository lessonRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
    }

    /**
     * Checks if a user has access to a specific course.
     * A user has access if they are enrolled in the course.
     *
     * @param userId the user ID
     * @param courseId the course ID
     * @return true if user is enrolled in the course or is an admin
     * @throws ResourceNotFoundException if user or course not found
     */
    public boolean hasAccessToCourse(Long userId, Long courseId) {
        // Check if user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "userId", userId);
        }

        // Check if course exists
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course", "courseId", courseId);
        }

        // Check enrollment
        return userService.isUserEnrolledInCourse(userId, courseId);
    }

    /**
     * Checks if a user has access to a specific lesson.
     * A user has access if they are enrolled in the course that contains the lesson.
     *
     * @param userId the user ID
     * @param lessonId the lesson ID
     * @return true if user is enrolled in the course containing this lesson
     * @throws ResourceNotFoundException if user or lesson not found
     */
    public boolean hasAccessToLesson(Long userId, Long lessonId) {
        // Check if user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "userId", userId);
        }

        // Check if lesson exists and get its course
        var lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "lessonId", lessonId));

        Long courseId = lesson.getCourse().getIdCourse();

        // Check if user is enrolled in the course
        return userService.isUserEnrolledInCourse(userId, courseId);
    }

    /**
     * Checks if a user has access to specific lesson content.
     * A user has access if they are enrolled in the course that contains the lesson.
     *
     * @param userId the user ID
     * @param lessonId the lesson ID (content belongs to this lesson)
     * @return true if user is enrolled in the course containing this content
     * @throws ResourceNotFoundException if user or lesson not found
     */
    public boolean hasAccessToLessonContent(Long userId, Long lessonId) {
        // Same as lesson access - if you can access the lesson, you can access its content
        return hasAccessToLesson(userId, lessonId);
    }

    /**
     * Checks if a user can view a file resource.
     * A user can view a file if they are enrolled in the course containing the lesson with that file.
     *
     * @param userId the user ID
     * @param lessonId the lesson ID that contains the file
     * @return true if user can access the file
     */
    public boolean canAccessFile(Long userId, Long lessonId) {
        return hasAccessToLesson(userId, lessonId);
    }

    /**
     * Checks if a user is an admin or instructor in a course.
     * (To be implemented by security team with proper role handling)
     *
     * @param userId the user ID
     * @param courseId the course ID
     * @return true if user is instructor or admin
     */
    public boolean isInstructor(Long userId, Long courseId) {
        // This is a placeholder for role-based authorization
        // The security team should implement proper role handling
        return false;
    }

    /**
     * Checks if a user is an admin.
     *
     * @param userId the user ID
     * @return true if user is an admin
     */
    public boolean isAdmin(Long userId) {
        return userRepository.findById(userId)
                .map(user -> user.getRole() == tn.fiancia.financia.entities.UserRole.ADMIN)
                .orElse(false);
    }

    /**
     * Checks if a user's account is active.
     * Inactive users should not have access to content.
     *
     * @param userId the user ID
     * @return true if user account is active
     */
    public boolean isUserActive(Long userId) {
        return userRepository.findById(userId)
                .map(tn.fiancia.financia.entities.User::getIsActive)
                .orElse(false);
    }
}
