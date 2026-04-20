package tn.fiancia.financia.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.fiancia.financia.entities.Course;
import tn.fiancia.financia.entities.User;
import tn.fiancia.financia.exception.ResourceNotFoundException;
import tn.fiancia.financia.repositories.CourseRepository;
import tn.fiancia.financia.repositories.UserRepository;
import tn.fiancia.financia.services.base.BaseService;
import tn.fiancia.financia.validator.ValidationUtils;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service implementation for User entity operations.
 * Provides business logic for user management and course enrollment with proper access control.
 */
@Service
@Slf4j
public class UserServiceImpl extends BaseService<User, Long, UserRepository> implements IUserService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public UserServiceImpl(UserRepository userRepository, CourseRepository courseRepository) {
        super(userRepository, "User");
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public User createUser(User user) {
        log.info("Creating new user with username: {}", user.getUsername());
        
        // Validate user data
        ValidationUtils.validateNotEmpty(user.getUsername(), "Username");
        ValidationUtils.validateNotEmpty(user.getEmail(), "Email");
        ValidationUtils.validateNotEmpty(user.getPasswordHash(), "Password");
        
        // Check for existing username
        if (userRepository.existsByUsername(user.getUsername())) {
            log.warn("Username already exists: {}", user.getUsername());
            throw new IllegalArgumentException("Username already exists");
        }
        
        // Check for existing email
        if (userRepository.existsByEmail(user.getEmail())) {
            log.warn("Email already exists: {}", user.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }

        if (user.getRole() == null) {
            user.setRole(tn.fiancia.financia.entities.UserRole.STUDENT);
        }
        
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }

        User createdUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", createdUser.getUserId());
        
        return createdUser;
    }

    @Override
    public User updateUser(User user) {
        if (user.getUserId() == null || user.getUserId() <= 0) {
            log.warn("Invalid user ID for update: {}", user.getUserId());
            throw new IllegalArgumentException("User ID must be provided for update");
        }

        log.info("Updating user with ID: {}", user.getUserId());
        
        // Verify user exists
        User existingUser = findByIdOrThrow(user.getUserId());

        // Validate user data if username changed
        if (!existingUser.getUsername().equals(user.getUsername())) {
            ValidationUtils.validateNotEmpty(user.getUsername(), "Username");
            if (userRepository.existsByUsername(user.getUsername())) {
                throw new IllegalArgumentException("Username already exists");
            }
        }

        // Validate email if changed
        if (!existingUser.getEmail().equals(user.getEmail())) {
            ValidationUtils.validateNotEmpty(user.getEmail(), "Email");
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with ID: {}", updatedUser.getUserId());
        
        return updatedUser;
    }

    @Override
    public User getUserById(Long userId) {
        log.debug("Fetching user with ID: {}", userId);
        
        ValidationUtils.validatePositiveId(userId, "User ID");
        
        User user = findByIdOrThrow(userId);
        log.debug("User found with ID: {}", userId);
        
        return user;
    }

    @Override
    public Optional<User> getUserByUsername(String username) {
        log.debug("Fetching user with username: {}", username);
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        log.debug("Fetching user with email: {}", email);
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> getAllUsers() {
        log.debug("Fetching all users");
        List<User> users = userRepository.findAll();
        log.debug("Retrieved {} users", users.size());
        
        return users;
    }

    @Override
    public void deleteUser(Long userId) {
        log.info("Deleting user with ID: {}", userId);
        
        ValidationUtils.validatePositiveId(userId, "User ID");
        
        // Verify user exists
        findByIdOrThrow(userId);
        
        userRepository.deleteById(userId);
        log.info("User deleted successfully with ID: {}", userId);
    }

    @Override
    public void enrollUserInCourse(Long userId, Long courseId) {
        log.info("Enrolling user {} in course {}", userId, courseId);
        
        ValidationUtils.validatePositiveId(userId, "User ID");
        ValidationUtils.validatePositiveId(courseId, "Course ID");
        
        User user = findByIdOrThrow(userId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "courseId", courseId));
        
        if (!user.isCourseEnrolled(course)) {
            user.enrollCourse(course);
            userRepository.save(user);
            log.info("User {} enrolled in course {} successfully", userId, courseId);
        } else {
            log.warn("User {} is already enrolled in course {}", userId, courseId);
        }
    }

    @Override
    public void unenrollUserFromCourse(Long userId, Long courseId) {
        log.info("Unenrolling user {} from course {}", userId, courseId);
        
        ValidationUtils.validatePositiveId(userId, "User ID");
        ValidationUtils.validatePositiveId(courseId, "Course ID");
        
        User user = findByIdOrThrow(userId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "courseId", courseId));
        
        if (user.isCourseEnrolled(course)) {
            user.unenrollCourse(course);
            userRepository.save(user);
            log.info("User {} unenrolled from course {} successfully", userId, courseId);
        } else {
            log.warn("User {} is not enrolled in course {}", userId, courseId);
        }
    }

    @Override
    public boolean isUserEnrolledInCourse(Long userId, Long courseId) {
        log.debug("Checking if user {} is enrolled in course {}", userId, courseId);
        
        ValidationUtils.validatePositiveId(userId, "User ID");
        ValidationUtils.validatePositiveId(courseId, "Course ID");
        
        User user = findByIdOrThrow(userId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "courseId", courseId));
        
        return user.isCourseEnrolled(course);
    }

    @Override
    public Set<Long> getUserEnrolledCourses(Long userId) {
        log.debug("Fetching enrolled courses for user {}", userId);
        
        ValidationUtils.validatePositiveId(userId, "User ID");
        
        User user = findByIdOrThrow(userId);
        
        return user.getCourses().stream()
                .map(Course::getIdCourse)
                .collect(Collectors.toSet());
    }

    @Override
    public List<User> getUsersInCourse(Long courseId) {
        log.debug("Fetching users enrolled in course {}", courseId);
        
        ValidationUtils.validatePositiveId(courseId, "Course ID");
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "courseId", courseId));
        
        return course.getUsers().stream().toList();
    }

    @Override
    public void deactivateUser(Long userId) {
        log.info("Deactivating user with ID: {}", userId);
        
        ValidationUtils.validatePositiveId(userId, "User ID");
        
        User user = findByIdOrThrow(userId);
        user.setIsActive(false);
        userRepository.save(user);
        
        log.info("User deactivated successfully with ID: {}", userId);
    }

    @Override
    public void activateUser(Long userId) {
        log.info("Activating user with ID: {}", userId);
        
        ValidationUtils.validatePositiveId(userId, "User ID");
        
        User user = findByIdOrThrow(userId);
        user.setIsActive(true);
        userRepository.save(user);
        
        log.info("User activated successfully with ID: {}", userId);
    }
}
