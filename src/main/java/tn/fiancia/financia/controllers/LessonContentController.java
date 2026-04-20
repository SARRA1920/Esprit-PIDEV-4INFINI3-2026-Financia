package tn.fiancia.financia.controllers;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.fiancia.financia.entities.LessonContent;
import tn.fiancia.financia.entities.LessonType;
import tn.fiancia.financia.services.ILessonContentService;


@RestController
@RequestMapping("/lesson-content")
@AllArgsConstructor
public class LessonContentController {

    ILessonContentService contentService;

    @GetMapping("/{id}")
    public LessonContent getContent(@PathVariable Long id) {
        return contentService.getContent(id);
    }

    @PostMapping("/text/{lessonId}")
    public LessonContent addText(@PathVariable Long lessonId, @RequestBody String text) {
        return contentService.addTextContent(lessonId, text);
    }

    @PostMapping("/file/{lessonId}")
    public LessonContent addFile(@PathVariable Long lessonId,
                                 @RequestParam("file") MultipartFile file) {
        String contentType = file.getContentType();
        LessonType type;
        if (contentType.startsWith("video/")) {
            type = LessonType.VIDEO;
        } else if (contentType.startsWith("text/") || contentType.equals("application/pdf")) {
            type = LessonType.FILE;
        } else {
            return null;
        }

        return contentService.addFileContent(lessonId, file, type);
    }

    @PostMapping("/quiz/{lessonId}")
    public LessonContent addQuiz(@PathVariable Long lessonId, @RequestBody JsonNode quizJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String cleanJson = mapper.writeValueAsString(quizJson);

            return contentService.addQuizContent(lessonId, cleanJson);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    @PutMapping("/text/update/{contentId}")
    public LessonContent updateText(@PathVariable Long contentId, @RequestBody String newText) {
        return contentService.updateTextContent(contentId, newText);
    }

    @PutMapping("/file/update/{contentId}")
    public LessonContent updateFile(@PathVariable Long contentId,
                                    @RequestParam("file") MultipartFile newFile) {
        String contentType = newFile.getContentType();
        LessonType type;
        if (contentType.startsWith("video/")) {
            type = LessonType.VIDEO;
        } else if (contentType.startsWith("text/") || contentType.equals("application/pdf")) {
            type = LessonType.FILE;
        } else {
            return null;
        }

        return contentService.updateFileContent(contentId, newFile, type);
    }

    @PutMapping("/quiz/update/{contentId}")
    public LessonContent updateQuiz(@PathVariable Long contentId, @RequestBody JsonNode newQuizJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String cleanJson = mapper.writeValueAsString(newQuizJson);

            return contentService.updateQuizContent(contentId, cleanJson);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    @DeleteMapping("/delete/{contentId}")
    public String deleteContent(@PathVariable Long contentId) {
        boolean deleted = contentService.deleteContent(contentId);
        return deleted ? "Deleted successfully" : "Content not found";
    }
}

