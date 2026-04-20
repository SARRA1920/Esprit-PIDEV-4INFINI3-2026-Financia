package tn.fiancia.financia.services;

import tn.fiancia.financia.entities.User;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for User entity operations.
 * Defines contract for user management and course enrollment.
 */
public interface IUserService {

    /**
     * Creates a new user account.
     *
     * @param user the user to create
     * @return the created user
     * @throws tn.fiancia.financia.exception.ValidationException if user data is invalid
     */
    User createUser(User user);

    /**
     * Updates an existing user.
     *
     * @param user the user with updated data
     * @return the updated user
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if user not found
     */
    User updateUser(User user);

    /**
     * Retrieves a user by ID.
     *
     * @param userId the user ID
     * @return the user if found
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if user not found
     */
    User getUserById(Long userId);

    /**
     * Retrieves a user by username.
     *
     * @param username the username
     * @return Optional containing the user if found
     */
    Optional<User> getUserByUsername(String username);

    /**
     * Retrieves a user by email.
     *
     * @param email the email address
     * @return Optional containing the user if found
     */
    Optional<User> getUserByEmail(String email);

    /**
     * Retrieves all users.
     *
     * @return list of all users
     */
    List<User> getAllUsers();

    /**
     * Deletes a user by ID.
     *
     * @param userId the user ID
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if user not found
     */
    void deleteUser(Long userId);

    /**
     * Enrolls a user in a course.
     *
     * @param userId the user ID
     * @param courseId the course ID
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if user or course not found
     */
    void enrollUserInCourse(Long userId, Long courseId);

    /**
     * Unenrolls a user from a course.
     *
     * @param userId the user ID
     * @param courseId the course ID
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if user or course not found
     */
    void unenrollUserFromCourse(Long userId, Long courseId);

    /**
     * Checks if a user is enrolled in a course.
     * Used for access control on lessons and content.
     *
     * @param userId the user ID
     * @param courseId the course ID
     * @return true if user is enrolled in the course
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if user or course not found
     */
    boolean isUserEnrolledInCourse(Long userId, Long courseId);

    /**
     * Gets all courses a user is enrolled in.
     *
     * @param userId the user ID
     * @return set of course IDs the user is enrolled in
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if user not found
     */
    java.util.Set<Long> getUserEnrolledCourses(Long userId);

    /**
     * Gets all users enrolled in a course.
     * (For instructors to see class list)
     *
     * @param courseId the course ID
     * @return list of users enrolled in the course
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if course not found
     */
    List<User> getUsersInCourse(Long courseId);

    /**
     * Deactivates a user account.
     *
     * @param userId the user ID
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if user not found
     */
    void deactivateUser(Long userId);

    /**
     * Activates a user account.
     *
     * @param userId the user ID
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if user not found
     */
    void activateUser(Long userId);
}
