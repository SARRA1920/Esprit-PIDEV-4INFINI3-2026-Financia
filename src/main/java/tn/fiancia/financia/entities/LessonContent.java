package tn.fiancia.financia.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
public class LessonContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLessonContent;

    @OneToOne
    @JoinColumn(name = "idLesson", nullable = false)
    @JsonBackReference
    private Lesson lesson;

    @Column(columnDefinition = "TEXT")
    private String textContent;

    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String quizJson;

    @Column(columnDefinition = "LONGTEXT")
    private String textEnglish;

    @Column(columnDefinition = "LONGTEXT")
    private String textFrench;

    @Column(columnDefinition = "LONGTEXT")
    private String textArabic;
}

