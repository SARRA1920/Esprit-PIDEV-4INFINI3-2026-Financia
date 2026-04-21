package tn.esprit.financia.entities.formation;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * User entity representing a platform user.
 * Maintains a many-to-many relationship with courses that the user is enrolled in.
 * 
 * NOTE: This is a simplified version. Authentication and profile details
 * will be implemented by the authentication/security team.
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity(name = "LmsUser")
@Table(name = "lms_users", indexes = {
    @Index(name = "idx_username", columnList = "username", unique = true),
    @Index(name = "idx_email", columnList = "email", unique = true)
})
public class User {

    /**
     * Unique identifier for the user.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    /**
     * Username for login (unique, required).
     */
    @Column(nullable = false, unique = true, length = 100)
    private String username;

    /**
     * User email address (unique, required).
     */
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /**
     * User's first name.
     */
    @Column(length = 100)
    private String firstName;

    /**
     * User's last name.
     */
    @Column(length = 100)
    private String lastName;

    /**
     * Password hash (should be BCrypt or similar).
     */
    @Column(nullable = false)
    private String passwordHash = "test123";

    /**
     * User role for basic access control (ADMIN, INSTRUCTOR, STUDENT).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    /**
     * Whether the user account is active.
     */
    @Column(nullable = false)
    private Boolean isActive = true;

    /**
     * Timestamp when the user account was created.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp of the last account update.
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Many-to-many relationship with courses.
     * A user can enroll in multiple courses, and each course can have multiple users.
     */
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "user_courses",
        joinColumns = @JoinColumn(name = "userId", nullable = false),
        inverseJoinColumns = @JoinColumn(name = "courseId", nullable = false),
        indexes = {
            @Index(name = "idx_user_id", columnList = "userId"),
            @Index(name = "idx_course_id", columnList = "courseId")
        }
    )
    @JsonManagedReference
    private Set<Course> courses = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Helper method to enroll user in a course.
     */
    public void enrollCourse(Course course) {
        this.courses.add(course);
        course.getUsers().add(this);
    }

    /**
     * Helper method to unenroll user from a course.
     */
    public void unenrollCourse(Course course) {
        this.courses.remove(course);
        course.getUsers().remove(this);
    }

    /**
     * Checks if user is enrolled in a specific course.
     */
    public boolean isCourseEnrolled(Course course) {
        return this.courses.contains(course);
    }

    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", isActive=" + isActive +
                '}';
    }
}
