package tn.fiancia.financia.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.fiancia.financia.entities.Course;
import tn.fiancia.financia.entities.Lesson;
import tn.fiancia.financia.repositories.CourseRepository;
import tn.fiancia.financia.repositories.LessonRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class LessonServiceImpl implements ILessonService {

    private final CourseRepository courseRepository;
    LessonRepository lessonRepository;

    @Override
    public Lesson addLesson(Lesson lesson, long idCourse) {
        Course course = courseRepository.findById(idCourse).orElse(null);
        if (course == null) {
            return null;
        }
        lesson.setCourse(course);
        return lessonRepository.save(lesson);
    }

    @Override
    public Lesson updateLesson(Lesson lesson) {
        if (lesson.getCourse() == null) {
            Lesson existingLesson = lessonRepository.findById(lesson.getIdLesson()).orElse(null);
            if (existingLesson != null) {
                lesson.setCourse(existingLesson.getCourse());
            }
        }
        return lessonRepository.save(lesson);
    }

    @Override
    public Lesson getLesson(long idLesson) {
        return lessonRepository.findById(idLesson).orElse(null);
    }

    @Override
    public void deleteLesson(long idLesson) {
        lessonRepository.deleteById(idLesson);
    }

    @Override
    public List<Lesson> getAllLessons() {
        return (List<Lesson>) lessonRepository.findAll();
    }

    @Override
    public List<Lesson> addAllLessons(List<Lesson> lessons, long idCourse) {
        Course course = courseRepository.findById(idCourse).orElse(null);
        if (course == null) {
            return null;
        }

        for (Lesson lesson : lessons) {
            lesson.setCourse(course);
        }

        return (List<Lesson>) lessonRepository.saveAll(lessons);
    }
}


