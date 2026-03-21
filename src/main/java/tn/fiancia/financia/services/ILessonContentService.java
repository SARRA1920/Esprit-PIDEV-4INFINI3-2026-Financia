package tn.fiancia.financia.services;

import org.springframework.web.multipart.MultipartFile;
import tn.fiancia.financia.entities.LessonContent;
import tn.fiancia.financia.entities.LessonType;

public interface ILessonContentService {

    LessonContent addTextContent(Long lessonId, String text);

    LessonContent addFileContent(Long lessonId, MultipartFile file, LessonType type);

    LessonContent addQuizContent(Long lessonId, String quizJson);

    LessonContent getContent(Long idContent);

    LessonContent getContentByLessonId(Long lessonId);

    LessonContent updateTextContent(Long contentId, String newText);

    LessonContent updateQuizContent(Long contentId, String newQuizJson);

    LessonContent updateFileContent(Long contentId, MultipartFile newFile, LessonType type);

    LessonContent updateContent(LessonContent content);

    boolean deleteContent(Long contentId);
}
