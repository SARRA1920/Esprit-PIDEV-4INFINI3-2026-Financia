package tn.fiancia.financia.controllers;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.fiancia.financia.dto.ApiResponse;
import tn.fiancia.financia.dto.UserDto;
import tn.fiancia.financia.entities.User;
import tn.fiancia.financia.services.IUserService;
import tn.fiancia.financia.util.EntityDtoMapper;

import java.util.List;
import java.util.Set;

/**
 * REST controller for User management and course enrollment.
 * Handles HTTP requests for user operations and access control checks.
 * 
 * This controller focuses on enrollment management and security-related operations.
 * Authentication endpoints should be handled by the security team.
 */
@RestController
@RequestMapping("/user")
@AllArgsConstructor
@Slf4j
public class UserController {

    private final IUserService userService;

    /**
     * Creates a new user account.
     *
     * @param userDto the user data
     * @return response with created user
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody UserDto userDto) {
        log.info("Received request to create user with username: {}", userDto.getUsername());
        
        try {
            User user = EntityDtoMapper.toEntity(userDto);
            User createdUser = userService.createUser(user);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            EntityDtoMapper.toDto(createdUser),
                            "User created successfully"));
        } catch (Exception e) {
            log.error("Error creating user", e);
            throw e;
        }
    }

    /**
     * Gets user profile by ID.
     *
     * @param userId the user ID
     * @return response with user profile
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable Long userId) {
        log.info("Received request to get user with ID: {}", userId);
        
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(ApiResponse.success(
                    EntityDtoMapper.toDto(user),
                    "User retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving user", e);
            throw e;
        }
    }

    /**
     * Gets user by username.
     *
     * @param username the username
     * @return response with user profile
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserDto>> getUserByUsername(@PathVariable String username) {
        log.info("Received request to get user with username: {}", username);
        
        try {
            User user = userService.getUserByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            return ResponseEntity.ok(ApiResponse.success(
                    EntityDtoMapper.toDto(user),
                    "User retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving user", e);
            throw e;
        }
    }

    /**
     * Updates a user profile.
     *
     * @param userDto the updated user data
     * @return response with updated user
     */
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@RequestBody UserDto userDto) {
        log.info("Received request to update user with ID: {}", userDto.getUserId());
        
        try {
            User user = EntityDtoMapper.toEntity(userDto);
            User updatedUser = userService.updateUser(user);
            
            return ResponseEntity.ok(ApiResponse.success(
                    EntityDtoMapper.toDto(updatedUser),
                    "User updated successfully"));
        } catch (Exception e) {
            log.error("Error updating user", e);
            throw e;
        }
    }

    /**
     * Deletes a user account.
     *
     * @param userId the user ID
     * @return response indicating successful deletion
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        log.info("Received request to delete user with ID: {}", userId);
        
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting user", e);
            throw e;
        }
    }

    // ========== Course Enrollment Endpoints ==========

    /**
     * Enrolls a user in a course.
     *
     * @param userId the user ID
     * @param courseId the course ID
     * @return response indicating successful enrollment
     */
    @PostMapping("/{userId}/enroll/{courseId}")
    public ResponseEntity<ApiResponse<Void>> enrollInCourse(
            @PathVariable Long userId,
            @PathVariable Long courseId) {
        log.info("Received request to enroll user {} in course {}", userId, courseId);
        
        try {
            userService.enrollUserInCourse(userId, courseId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(null, "User enrolled successfully"));
        } catch (Exception e) {
            log.error("Error enrolling user", e);
            throw e;
        }
    }

    /**
     * Unenrolls a user from a course.
     *
     * @param userId the user ID
     * @param courseId the course ID
     * @return response indicating successful unenrollment
     */
    @PostMapping("/{userId}/unenroll/{courseId}")
    public ResponseEntity<ApiResponse<Void>> unenrollFromCourse(
            @PathVariable Long userId,
            @PathVariable Long courseId) {
        log.info("Received request to unenroll user {} from course {}", userId, courseId);
        
        try {
            userService.unenrollUserFromCourse(userId, courseId);
            return ResponseEntity.ok(ApiResponse.success(null, "User unenrolled successfully"));
        } catch (Exception e) {
            log.error("Error unenrolling user", e);
            throw e;
        }
    }

    /**
     * Checks if a user is enrolled in a course.
     * Used by security layer for access control on lessons and content.
     *
     * @param userId the user ID
     * @param courseId the course ID
     * @return response with enrollment status
     */
    @GetMapping("/{userId}/enrolled/{courseId}")
    public ResponseEntity<ApiResponse<Boolean>> isEnrolledInCourse(
            @PathVariable Long userId,
            @PathVariable Long courseId) {
        log.debug("Checking enrollment status for user {} in course {}", userId, courseId);
        
        try {
            boolean enrolled = userService.isUserEnrolledInCourse(userId, courseId);
            return ResponseEntity.ok(ApiResponse.success(
                    enrolled,
                    "Enrollment status retrieved"));
        } catch (Exception e) {
            log.error("Error checking enrollment", e);
            throw e;
        }
    }

    /**
     * Gets all courses a user is enrolled in.
     *
     * @param userId the user ID
     * @return response with list of course IDs
     */
    @GetMapping("/{userId}/courses")
    public ResponseEntity<ApiResponse<Set<Long>>> getUserCourses(@PathVariable Long userId) {
        log.info("Received request to get courses for user {}", userId);
        
        try {
            Set<Long> courseIds = userService.getUserEnrolledCourses(userId);
            return ResponseEntity.ok(ApiResponse.success(
                    courseIds,
                    "User courses retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving user courses", e);
            throw e;
        }
    }

    /**
     * Gets all users enrolled in a course.
     * (For instructors to see class list)
     *
     * @param courseId the course ID
     * @return response with list of users
     */
    @GetMapping("/course/{courseId}/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getCourseUsers(@PathVariable Long courseId) {
        log.info("Received request to get users in course {}", courseId);
        
        try {
            List<User> users = userService.getUsersInCourse(courseId);
            return ResponseEntity.ok(ApiResponse.success(
                    EntityDtoMapper.toDtoUserList(users),
                    "Course users retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving course users", e);
            throw e;
        }
    }

    /**
     * Deactivates a user account.
     *
     * @param userId the user ID
     * @return response indicating successful deactivation
     */
    @PostMapping("/{userId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long userId) {
        log.info("Received request to deactivate user {}", userId);
        
        try {
            userService.deactivateUser(userId);
            return ResponseEntity.ok(ApiResponse.success(null, "User deactivated successfully"));
        } catch (Exception e) {
            log.error("Error deactivating user", e);
            throw e;
        }
    }

    /**
     * Activates a user account.
     *
     * @param userId the user ID
     * @return response indicating successful activation
     */
    @PostMapping("/{userId}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long userId) {
        log.info("Received request to activate user {}", userId);
        
        try {
            userService.activateUser(userId);
            return ResponseEntity.ok(ApiResponse.success(null, "User activated successfully"));
        } catch (Exception e) {
            log.error("Error activating user", e);
            throw e;
        }
    }
}
