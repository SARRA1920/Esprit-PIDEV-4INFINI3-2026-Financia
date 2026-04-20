package tn.fiancia.financia.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * LessonContent entity storing the actual content of a lesson.
 * Can contain text, file paths, or quiz data in multiple languages.
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "lesson_contents", indexes = {
    @Index(name = "idx_lesson", columnList = "idLesson")
})
public class LessonContent {

    /**
     * Unique identifier for the lesson content.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLessonContent;

    /**
     * Reference to the lesson this content belongs to.
     */
    @OneToOne
    @JoinColumn(name = "idLesson", nullable = false)
    @JsonBackReference
    private Lesson lesson;

    /**
     * Original text content (required for TEXT type lessons).
     */
    @Column(columnDefinition = "TEXT")
    private String textContent;

    /**
     * File URL path for FILE or VIDEO type lessons.
     */
    private String fileUrl;

    /**
     * Quiz structure in JSON format (required for QUIZ type lessons).
     */
    @Column(columnDefinition = "TEXT")
    private String quizJson;

    /**
     * Content translated to English.
     */
    @Column(columnDefinition = "LONGTEXT")
    private String textEnglish;

    /**
     * Content translated to French.
     */
    @Column(columnDefinition = "LONGTEXT")
    private String textFrench;

    /**
     * Content translated to Arabic.
     */
    @Column(columnDefinition = "LONGTEXT")
    private String textArabic;

    @Override
    public String toString() {
        return "LessonContent{" +
                "idLessonContent=" + idLessonContent +
                ", fileUrl='" + fileUrl + '\'' +
                '}';
    }
}

