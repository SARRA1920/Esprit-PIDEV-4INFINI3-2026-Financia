package tn.esprit.financia.ai;

import tn.esprit.financia.entities.formation.LessonContent;

public interface QuizGenerationService {
    String generateQuiz(LessonContent content);
}
