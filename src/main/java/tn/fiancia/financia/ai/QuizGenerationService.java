package tn.fiancia.financia.ai;

import tn.fiancia.financia.entities.LessonContent;

public interface QuizGenerationService {
    String generateQuiz(LessonContent content);
}
