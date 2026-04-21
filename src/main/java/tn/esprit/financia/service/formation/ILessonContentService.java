package tn.esprit.financia.service.formation;

import org.springframework.web.multipart.MultipartFile;
import tn.esprit.financia.entities.formation.LessonContent;
import tn.esprit.financia.entities.formation.LessonType;

/**
 * Service interface for LessonContent entity operations.
 * Defines contract for lesson content management including text, files, and quizzes.
 */
public interface ILessonContentService {

    /**
     * Adds text content to a lesson.
     *
     * @param lessonId the lesson ID
     * @param text the text content
     * @return the created lesson content
     * @throws tn.esprit.financia.exception.ResourceNotFoundException if lesson not found
     * @throws tn.esprit.financia.exception.ValidationException if text is invalid
     */
    LessonContent addTextContent(Long lessonId, String text);

    /**
     * Adds file content to a lesson.
     * Automatically extracts text from PDF and DOCX files.
     *
     * @param lessonId the lesson ID
     * @param file the file to upload
     * @param type the lesson type
     * @return the created lesson content
     * @throws tn.esprit.financia.exception.ResourceNotFoundException if lesson not found
     * @throws tn.esprit.financia.exception.ValidationException if file is invalid
     */
    LessonContent addFileContent(Long lessonId, MultipartFile file, LessonType type);

    /**
     * Adds quiz content to a lesson.
     *
     * @param lessonId the lesson ID
     * @param quizJson the quiz data in JSON format
     * @return the created lesson content
     * @throws tn.esprit.financia.exception.ResourceNotFoundException if lesson not found
     */
    LessonContent addQuizContent(Long lessonId, String quizJson);

    /**
     * Retrieves lesson content by content ID.
     *
     * @param contentId the content ID
     * @return the lesson content
     * @throws tn.esprit.financia.exception.ResourceNotFoundException if content not found
     */
    LessonContent getContent(Long contentId);

    /**
     * Retrieves lesson content by lesson ID.
     *
     * @param lessonId the lesson ID
     * @return the lesson content
     * @throws tn.esprit.financia.exception.ResourceNotFoundException if lesson not found
     */
    LessonContent getContentByLessonId(Long lessonId);

    /**
     * Updates text content of a lesson.
     *
     * @param contentId the content ID
     * @param newText the new text content
     * @return the updated lesson content
     * @throws tn.esprit.financia.exception.ResourceNotFoundException if content not found
     */
    LessonContent updateTextContent(Long contentId, String newText);

    /**
     * Updates quiz content of a lesson.
     *
     * @param contentId the content ID
     * @param newQuizJson the new quiz data in JSON format
     * @return the updated lesson content
     * @throws tn.esprit.financia.exception.ResourceNotFoundException if content not found
     */
    LessonContent updateQuizContent(Long contentId, String newQuizJson);

    /**
     * Updates file content of a lesson.
     * Automatically extracts text from PDF and DOCX files.
     *
     * @param contentId the content ID
     * @param newFile the new file to upload
     * @param type the lesson type
     * @return the updated lesson content
     * @throws tn.esprit.financia.exception.ResourceNotFoundException if content not found
     */
    LessonContent updateFileContent(Long contentId, MultipartFile newFile, LessonType type);

    /**
     * Updates a lesson content entity.
     *
     * @param content the updated content entity
     * @return the updated lesson content
     * @throws tn.esprit.financia.exception.ResourceNotFoundException if content not found
     */
    LessonContent updateContent(LessonContent content);

    /**
     * Deletes lesson content.
     *
     * @param contentId the content ID
     * @return true if deletion was successful
     * @throws tn.esprit.financia.exception.ResourceNotFoundException if content not found
     */
    boolean deleteContent(Long contentId);
}
