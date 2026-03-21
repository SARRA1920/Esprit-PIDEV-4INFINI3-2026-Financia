package tn.fiancia.financia.services;

import tn.fiancia.financia.entities.Lesson;

import java.util.List;

public interface ILessonService {
    Lesson addLesson(Lesson lesson, long idCourse);
    Lesson updateLesson(Lesson lesson);
    Lesson getLesson(long idLesson);
    void deleteLesson(long idLesson);
    List<Lesson> getAllLessons();
    List<Lesson> addAllLessons(List<Lesson> lessons, long idCourse);
}


