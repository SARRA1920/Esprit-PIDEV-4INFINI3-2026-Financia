package tn.fiancia.financia.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.fiancia.financia.ai.TextExtractionService;
import tn.fiancia.financia.ai.TranslationService;
import tn.fiancia.financia.entities.Lesson;
import tn.fiancia.financia.entities.LessonContent;
import tn.fiancia.financia.entities.LessonType;
import tn.fiancia.financia.repositories.LessonContentRepository;
import tn.fiancia.financia.repositories.LessonRepository;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Service
@AllArgsConstructor
public class LessonContentServiceImpl implements ILessonContentService {

    LessonContentRepository contentRepository;
    LessonRepository lessonRepository;
    private final StorageServiceImpl storageService;
    private final TextExtractionService textExtractionService;
    private final TranslationService translationService;


    @Override
    public LessonContent addTextContent(Long lessonId, String text) {
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) return null;

        lesson.setType(LessonType.TEXT);

        LessonContent content = new LessonContent();
        content.setLesson(lesson);
        content.setTextContent(text);

        return contentRepository.save(content);
    }

    @Override
    public LessonContent addFileContent(Long lessonId, MultipartFile file, LessonType type) {
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) return null;

        lesson.setType(type);
        Long courseId = lesson.getCourse().getIdCourse();
        String filePath = storageService.store(file, courseId, lessonId);

        LessonContent content = new LessonContent();
        content.setLesson(lesson);
        content.setFileUrl(filePath);

        // Extract text from PDF or DOCX files
        if (isPdfOrDocx(file.getOriginalFilename())) {
            Path fullPath = Paths.get("uploads", filePath);
            String extractedText = textExtractionService.extractText(fullPath);
            
            if (!extractedText.isBlank()) {
                content.setTextContent(extractedText);
                
                // Translate extracted text to English, French, Arabic
                Map<String, String> translations = translationService.translateToMultiLanguages(extractedText);
                content.setTextEnglish(translations.get("en"));
                content.setTextFrench(translations.get("fr"));
                content.setTextArabic(translations.get("ar"));
            }
        }

        return contentRepository.save(content);
    }

    @Override
    public LessonContent addQuizContent(Long lessonId, String quizJson) {
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) return null;

        lesson.setType(LessonType.QUIZ);

        LessonContent content = new LessonContent();
        content.setLesson(lesson);
        content.setQuizJson(quizJson);

        return contentRepository.save(content);
    }

    @Override
    public LessonContent getContent(Long idContent) {
        return contentRepository.findById(idContent).orElse(null);
    }

    @Override
    public LessonContent getContentByLessonId(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) return null;
        return lesson.getContent();
    }

    @Override
    public LessonContent updateContent(LessonContent content) {
        return contentRepository.save(content);
    }

    @Override
    public LessonContent updateTextContent(Long contentId, String newText) {
        LessonContent content = contentRepository.findById(contentId).orElse(null);
        if (content == null) return null;

        Lesson lesson = content.getLesson();
        if (lesson.getType() == LessonType.FILE || lesson.getType() == LessonType.VIDEO) {
            storageService.delete(content.getFileUrl());
        }

        content.getLesson().setType(LessonType.TEXT);
        content.setTextContent(newText);
        content.setFileUrl(null);
        content.setQuizJson(null);
        return contentRepository.save(content);
    }

    @Override
    public LessonContent updateQuizContent(Long contentId, String newQuizJson) {
        LessonContent content = contentRepository.findById(contentId).orElse(null);
        if (content == null) return null;

        Lesson lesson = content.getLesson();
        if (lesson.getType() == LessonType.FILE || lesson.getType() == LessonType.VIDEO) {
            storageService.delete(content.getFileUrl());
        }

        content.getLesson().setType(LessonType.QUIZ);
        content.setQuizJson(newQuizJson);
        content.setFileUrl(null);
        content.setTextContent(null);
        return contentRepository.save(content);
    }

    @Override
    public LessonContent updateFileContent(Long contentId, MultipartFile newFile, LessonType type) {
        LessonContent content = contentRepository.findById(contentId).orElse(null);
        if (content == null) return null;

        Lesson lesson = content.getLesson();
        if (lesson.getType() == LessonType.FILE || lesson.getType() == LessonType.VIDEO) {
            storageService.delete(content.getFileUrl());
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
            Path fullPath = Paths.get("uploads", newFilePath);
            String extractedText = textExtractionService.extractText(fullPath);
            
            if (!extractedText.isBlank()) {
                content.setTextContent(extractedText);
                
                // Translate extracted text
                Map<String, String> translations = translationService.translateToMultiLanguages(extractedText);
                content.setTextEnglish(translations.get("en"));
                content.setTextFrench(translations.get("fr"));
                content.setTextArabic(translations.get("ar"));
            }
        }

        return contentRepository.save(content);
    }

    @Override
    public boolean deleteContent(Long contentId) {
        LessonContent content = contentRepository.findById(contentId).orElse(null);
        if (content == null) return false;

        Lesson lesson = content.getLesson();

        if (lesson.getType() == LessonType.VIDEO || lesson.getType() == LessonType.FILE) {
            storageService.delete(content.getFileUrl());
        }

        lesson.setContent(null);

        contentRepository.deleteById(contentId);
        return true;
    }

    /**
     * Helper method to check if file is PDF or DOCX.
     */
    private boolean isPdfOrDocx(String filename) {
        if (filename == null) return false;
        String lower = filename.toLowerCase();
        return lower.endsWith(".pdf") || lower.endsWith(".docx");
    }
}
