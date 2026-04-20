package tn.fiancia.financia.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Course entity representing a learning course.
 * Contains basic course information and maintains relationships with lessons and users.
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "courses", indexes = {
    @Index(name = "idx_title", columnList = "title")
})
public class Course {

    /**
     * Unique identifier for the course.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCourse;

    /**
     * Course title (required).
     */
    @Column(nullable = false, length = 255)
    private String title;

    /**
     * Course description (optional).
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * List of lessons in this course, ordered by index.
     * Automatically cascades all operations to lessons.
     */
    @OneToMany(
            mappedBy = "course",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("orderIndex ASC")
    @JsonManagedReference
    private List<Lesson> lessons;

    /**
     * Set of users enrolled in this course.
     * A course can have multiple users, and a user can enroll in multiple courses.
     */
    @ManyToMany(mappedBy = "courses", fetch = FetchType.LAZY)
    @JsonBackReference
    private Set<User> users = new HashSet<>();

    @Override
    public String toString() {
        return "Course{" +
                "idCourse=" + idCourse +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
