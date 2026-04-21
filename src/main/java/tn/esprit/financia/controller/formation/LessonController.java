package tn.esprit.financia.controller.formation;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.formation.Lesson;
import tn.esprit.financia.service.formation.ILessonService;

import java.util.List;

@RestController
@RequestMapping("/lesson")
@AllArgsConstructor
public class LessonController {
    ILessonService lessonService;

    @PostMapping("/addLesson/{idCourse}")
    public Lesson addLesson(@RequestBody Lesson lesson, @PathVariable long idCourse) {
        return lessonService.addLesson(lesson, idCourse);
    }

    @PostMapping("/updateLesson")
    public Lesson updateLesson(@RequestBody Lesson lesson) {
        return lessonService.updateLesson(lesson);
    }

    @GetMapping("/getLesson/{idLesson}")
    public Lesson getLesson(@PathVariable long idLesson) {
        return lessonService.getLesson(idLesson);
    }

    @DeleteMapping("/deleteLesson/{idLesson}")
    public void deleteLesson(@PathVariable long idLesson) {
        lessonService.deleteLesson(idLesson);
    }

    @GetMapping("/getAllLessons")
    public List<Lesson> getAllLessons() {
        return lessonService.getAllLessons();
    }

    @PostMapping("/addAllLessons/{idCourse}")
    public List<Lesson> addAllLessons(@RequestBody List<Lesson> lessons, @PathVariable long idCourse) {
        return lessonService.addAllLessons(lessons, idCourse);
    }
}
