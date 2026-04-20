package tn.fiancia.financia.services;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.fiancia.financia.ai.TextExtractionService;
import tn.fiancia.financia.ai.TranslationService;
import tn.fiancia.financia.entities.Lesson;
import tn.fiancia.financia.entities.LessonContent;
import tn.fiancia.financia.entities.LessonType;
import tn.fiancia.financia.exception.ResourceNotFoundException;
import tn.fiancia.financia.repositories.LessonContentRepository;
import tn.fiancia.financia.repositories.LessonRepository;
import tn.fiancia.financia.validator.ValidationUtils;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

/**
 * Service implementation for LessonContent entity operations.
 * Provides business logic for managing lesson content including text, files, and quizzes.
 */
@Service
@AllArgsConstructor
@Slf4j
public class LessonContentServiceImpl implements ILessonContentService {

    private final LessonContentRepository contentRepository;
    private final LessonRepository lessonRepository;
    private final StorageServiceImpl storageService;
    private final TextExtractionService textExtractionService;
    private final TranslationService translationService;

    @Override
    public LessonContent addTextContent(Long lessonId, String text) {
        log.info("Adding text content to lesson ID: {}", lessonId);
        
        ValidationUtils.validatePositiveId(lessonId, "Lesson ID");
        ValidationUtils.validateTextContent(text);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "lessonId", lessonId));

        lesson.setType(LessonType.TEXT);

        LessonContent content = new LessonContent();
        content.setLesson(lesson);
        content.setTextContent(text);

        LessonContent savedContent = contentRepository.save(content);
        log.info("Text content added successfully to lesson ID: {}", lessonId);
        
        return savedContent;
    }

    @Override
    public LessonContent addFileContent(Long lessonId, MultipartFile file, LessonType type) {
        log.info("Adding file content to lesson ID: {} with type: {}", lessonId, type);
        
        ValidationUtils.validatePositiveId(lessonId, "Lesson ID");
        
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "lessonId", lessonId));

        lesson.setType(type);
        Long courseId = lesson.getCourse().getIdCourse();
        String filePath = storageService.store(file, courseId, lessonId);

        LessonContent content = new LessonContent();
        content.setLesson(lesson);
        content.setFileUrl(filePath);

        // Extract text from PDF or DOCX files
        if (isPdfOrDocx(file.getOriginalFilename())) {
            try {
                Path fullPath = Paths.get("uploads", filePath);
                String extractedText = textExtractionService.extractText(fullPath);
                
                if (extractedText != null && !extractedText.isBlank()) {
                    content.setTextContent(extractedText);
                    
                    // Translate extracted text to multiple languages
                    Map<String, String> translations = translationService.translateToMultiLanguages(extractedText);
                    content.setTextEnglish(translations.get("en"));
                    content.setTextFrench(translations.get("fr"));
                    content.setTextArabic(translations.get("ar"));
                    
                    log.info("Text extracted and translated for file: {}", file.getOriginalFilename());
                }
            } catch (Exception e) {
                log.warn("Failed to extract text from file: {}", file.getOriginalFilename(), e);
            }
        }

        LessonContent savedContent = contentRepository.save(content);
        log.info("File content added successfully to lesson ID: {}", lessonId);
        
        return savedContent;
    }

    @Override
    public LessonContent addQuizContent(Long lessonId, String quizJson) {
        log.info("Adding quiz content to lesson ID: {}", lessonId);
        
        ValidationUtils.validatePositiveId(lessonId, "Lesson ID");
        
        if (quizJson == null || quizJson.trim().isEmpty()) {
            throw new IllegalArgumentException("Quiz JSON cannot be empty");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "lessonId", lessonId));

        lesson.setType(LessonType.QUIZ);

        LessonContent content = new LessonContent();
        content.setLesson(lesson);
        content.setQuizJson(quizJson);

        LessonContent savedContent = contentRepository.save(content);
        log.info("Quiz content added successfully to lesson ID: {}", lessonId);
        
        return savedContent;
    }

    @Override
    public LessonContent getContent(Long contentId) {
        log.debug("Fetching content with ID: {}", contentId);
        
        ValidationUtils.validatePositiveId(contentId, "Content ID");

        LessonContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("LessonContent", "contentId", contentId));
        
        log.debug("Content found with ID: {}", contentId);
        return content;
    }

    @Override
    public LessonContent getContentByLessonId(Long lessonId) {
        log.debug("Fetching content for lesson ID: {}", lessonId);
        
        ValidationUtils.validatePositiveId(lessonId, "Lesson ID");

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "lessonId", lessonId));
        
        return lesson.getContent();
    }

    @Override
    public LessonContent updateContent(LessonContent content) {
        if (content == null || content.getIdLessonContent() == null) {
            throw new IllegalArgumentException("Content ID must be provided for update");
        }

        log.info("Updating content with ID: {}", content.getIdLessonContent());
        
        // Verify content exists
        contentRepository.findById(content.getIdLessonContent())
                .orElseThrow(() -> new ResourceNotFoundException("LessonContent", "contentId", content.getIdLessonContent()));

        LessonContent updatedContent = contentRepository.save(content);
        log.info("Content updated successfully with ID: {}", updatedContent.getIdLessonContent());
        
        return updatedContent;
    }

    @Override
    public LessonContent updateTextContent(Long contentId, String newText) {
        log.info("Updating text content with ID: {}", contentId);
        
        ValidationUtils.validatePositiveId(contentId, "Content ID");
        ValidationUtils.validateTextContent(newText);

        LessonContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("LessonContent", "contentId", contentId));

        Lesson lesson = content.getLesson();
        
        // Clean up file if it exists
        if (lesson.getType() == LessonType.FILE || lesson.getType() == LessonType.VIDEO) {
            if (content.getFileUrl() != null) {
                storageService.delete(content.getFileUrl());
            }
        }

        lesson.setType(LessonType.TEXT);
        content.setTextContent(newText);
        content.setFileUrl(null);
        content.setQuizJson(null);
        
        LessonContent updatedContent = contentRepository.save(content);
        log.info("Text content updated successfully with ID: {}", updatedContent.getIdLessonContent());
        
        return updatedContent;
    }

    @Override
    public LessonContent updateQuizContent(Long contentId, String newQuizJson) {
        log.info("Updating quiz content with ID: {}", contentId);
        
        ValidationUtils.validatePositiveId(contentId, "Content ID");
        
        if (newQuizJson == null || newQuizJson.trim().isEmpty()) {
            throw new IllegalArgumentException("Quiz JSON cannot be empty");
        }

        LessonContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("LessonContent", "contentId", contentId));

        Lesson lesson = content.getLesson();
        
        // Clean up file if it exists
        if (lesson.getType() == LessonType.FILE || lesson.getType() == LessonType.VIDEO) {
            if (content.getFileUrl() != null) {
                storageService.delete(content.getFileUrl());
            }
        }

        lesson.setType(LessonType.QUIZ);
        content.setQuizJson(newQuizJson);
        content.setFileUrl(null);
        content.setTextContent(null);
        
        LessonContent updatedContent = contentRepository.save(content);
        log.info("Quiz content updated successfully with ID: {}", updatedContent.getIdLessonContent());
        
        return updatedContent;
    }

    @Override
    public LessonContent updateFileContent(Long contentId, MultipartFile newFile, LessonType type) {
        log.info("Updating file content with ID: {} with type: {}", contentId, type);
        
        ValidationUtils.validatePositiveId(contentId, "Content ID");
        
        if (newFile == null || newFile.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        LessonContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("LessonContent", "contentId", contentId));

        Lesson lesson = content.getLesson();
        
        // Clean up old file
        if (lesson.getType() == LessonType.FILE || lesson.getType() == LessonType.VIDEO) {
            if (content.getFileUrl() != null) {
                storageService.delete(content.getFileUrl());
            }
        } else {
            content.setTextContent(null);
            content.setQuizJson(null);
        }

        lesson.setType(type);

        Long courseId = lesson.getCourse().getIdCourse();
        String newFilePath = storageService.store(newFile, courseId, lesson.getIdLesson());

        content.setFileUrl(newFilePath);

        // Extract text from new PDF or DOCX files
        if (isPdfOrDocx(newFile.getOriginalFilename())) {
            try {
                Path fullPath = Paths.get("uploads", newFilePath);
                String extractedText = textExtractionService.extractText(fullPath);
                
                if (extractedText != null && !extractedText.isBlank()) {
                    content.setTextContent(extractedText);
                    
                    // Translate extracted text to multiple languages
                    Map<String, String> translations = translationService.translateToMultiLanguages(extractedText);
                    content.setTextEnglish(translations.get("en"));
                    content.setTextFrench(translations.get("fr"));
                    content.setTextArabic(translations.get("ar"));
                    
                    log.info("Text extracted and translated for new file: {}", newFile.getOriginalFilename());
                }
            } catch (Exception e) {
                log.warn("Failed to extract text from file: {}", newFile.getOriginalFilename(), e);
            }
        }

        LessonContent updatedContent = contentRepository.save(content);
        log.info("File content updated successfully with ID: {}", updatedContent.getIdLessonContent());
        
        return updatedContent;
    }

    @Override
    public boolean deleteContent(Long contentId) {
        log.info("Deleting content with ID: {}", contentId);
        
        ValidationUtils.validatePositiveId(contentId, "Content ID");

        LessonContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("LessonContent", "contentId", contentId));

        Lesson lesson = content.getLesson();

        // Delete file if it exists
        if ((lesson.getType() == LessonType.VIDEO || lesson.getType() == LessonType.FILE) 
                && content.getFileUrl() != null) {
            storageService.delete(content.getFileUrl());
        }

        lesson.setContent(null);

        contentRepository.deleteById(contentId);
        log.info("Content deleted successfully with ID: {}", contentId);
        
        return true;
    }

    /**
     * Helper method to check if file is PDF or DOCX.
     */
    private boolean isPdfOrDocx(String filename) {
        if (filename == null) {
            return false;
        }
        String lower = filename.toLowerCase();
        return lower.endsWith(".pdf") || lower.endsWith(".docx");
    }
}
