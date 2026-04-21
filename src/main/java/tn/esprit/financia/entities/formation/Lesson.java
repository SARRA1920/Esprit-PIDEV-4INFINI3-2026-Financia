package tn.esprit.financia.entities.formation;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Lesson entity representing a lesson within a course.
 * Contains lesson metadata and maintains relationships with its parent course and content.
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "lessons", indexes = {
    @Index(name = "idx_course", columnList = "idCourse"),
    @Index(name = "idx_order", columnList = "orderIndex")
})
public class Lesson {

    /**
     * Unique identifier for the lesson.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLesson;

    /**
     * Lesson title (required).
     */
    @Column(nullable = false, length = 255)
    private String title;

    /**
     * Type of lesson content (TEXT, FILE, VIDEO, QUIZ).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LessonType type;

    /**
     * Display order of this lesson within the course.
     */
    private Integer orderIndex;

    /**
     * Reference to the parent course.
     * Required - every lesson must belong to a course.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCourse", nullable = false)
    @JsonBackReference
    private Course course;

    /**
     * Lesson content (text, file path, or quiz data).
     * One-to-one relationship with automatic cascading.
     */
    @OneToOne(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private LessonContent content;

    @Override
    public String toString() {
        return "Lesson{" +
                "idLesson=" + idLesson +
                ", title='" + title + '\'' +
                ", type=" + type +
                ", orderIndex=" + orderIndex +
                '}';
    }
}

