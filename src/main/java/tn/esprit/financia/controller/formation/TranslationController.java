package tn.esprit.financia.controller.formation;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.ai.QuizGenerationService;
import tn.esprit.financia.ai.TranslationService;
import tn.esprit.financia.entities.formation.LessonContent;
import tn.esprit.financia.repository.formation.LessonContentRepository;
import tn.esprit.financia.service.formation.ILessonContentService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@AllArgsConstructor
public class TranslationController {

    private final TranslationService translationService;
    private final QuizGenerationService quizGenerationService;
    private final ILessonContentService contentService;
    private final LessonContentRepository lessonContentRepository;

    @PostMapping("/translate/{lessonContentId}")
    public ResponseEntity<?> translateContent(@PathVariable Long lessonContentId, 
                                              @RequestParam(defaultValue = "en") String target) {
        
        LessonContent content = lessonContentRepository.findById(lessonContentId).orElse(null);
        if (content == null) {
            return ResponseEntity.notFound().build();
        }

        String textToTranslate = content.getTextContent();
        if (textToTranslate == null || textToTranslate.isBlank()) {
            return ResponseEntity.badRequest().body("No text content to translate");
        }

        String translatedText = translationService.translate(textToTranslate, target);

        switch (target.toLowerCase()) {
            case "fr":
                content.setTextFrench(translatedText);
                break;
            case "ar":
                content.setTextArabic(translatedText);
                break;
            case "en":
            default:
                content.setTextEnglish(translatedText);
                break;
        }

        lessonContentRepository.save(content);

        Map<String, String> response = new HashMap<>();
        response.put("original", textToTranslate);
        response.put("translated", translatedText);
        response.put("targetLanguage", target);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/translate/content/{lessonContentId}")
    public ResponseEntity<?> getContentInAllLanguages(@PathVariable Long lessonContentId) {
        LessonContent content = lessonContentRepository.findById(lessonContentId).orElse(null);
        if (content == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, String> languages = new HashMap<>();
        languages.put("en", content.getTextEnglish() != null ? content.getTextEnglish() : "");
        languages.put("fr", content.getTextFrench() != null ? content.getTextFrench() : "");
        languages.put("ar", content.getTextArabic() != null ? content.getTextArabic() : "");
        languages.put("original", content.getTextContent() != null ? content.getTextContent() : "");

        return ResponseEntity.ok(languages);
    }


    @PostMapping("/translate/detect")
    public ResponseEntity<?> detectLanguage(@RequestBody(required = false) String text, 
                                           @RequestParam(required = false) String param) {
        String textToDetect = text != null ? text : param;
        
        if (textToDetect == null || textToDetect.isBlank()) {
            return ResponseEntity.badRequest().body("No text provided for language detection");
        }
        
        String detectedLang = translationService.detectLanguage(textToDetect);

        Map<String, String> response = new HashMap<>();
        response.put("text", textToDetect);
        response.put("detectedLanguage", detectedLang);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-quiz/{lessonId}")
    public ResponseEntity<?> generateQuiz(@PathVariable Long lessonId) {
        try {
            LessonContent content = contentService.getContentByLessonId(lessonId);
            if (content == null) {
                return ResponseEntity.notFound().build();
            }

            if (content.getTextContent() == null || content.getTextContent().isBlank()) {
                return ResponseEntity.badRequest().body("Lesson has no text content to generate quiz from");
            }

            String quizJson = quizGenerationService.generateQuiz(content);
            
            content.setQuizJson(quizJson);
            LessonContent updated = contentService.updateContent(content);

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error generating quiz: " + e.getMessage());
        }
    }
}
