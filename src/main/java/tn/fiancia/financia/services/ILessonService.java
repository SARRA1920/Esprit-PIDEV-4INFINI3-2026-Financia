package tn.fiancia.financia.services;

import tn.fiancia.financia.entities.Lesson;

import java.util.List;

/**
 * Service interface for Lesson entity operations.
 * Defines contract for lesson management functionality.
 */
public interface ILessonService {

    /**
     * Creates a new lesson for a specific course.
     *
     * @param lesson the lesson to create
     * @param courseId the ID of the parent course
     * @return the created lesson
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if course not found
     * @throws tn.fiancia.financia.exception.ValidationException if lesson data is invalid
     */
    Lesson addLesson(Lesson lesson, long courseId);

    /**
     * Updates an existing lesson.
     *
     * @param lesson the lesson with updated data
     * @return the updated lesson
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if lesson not found
     * @throws tn.fiancia.financia.exception.ValidationException if lesson data is invalid
     */
    Lesson updateLesson(Lesson lesson);

    /**
     * Retrieves a lesson by ID.
     *
     * @param lessonId the lesson ID
     * @return the lesson if found
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if lesson not found
     */
    Lesson getLesson(long lessonId);

    /**
     * Deletes a lesson by ID.
     *
     * @param lessonId the lesson ID
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if lesson not found
     */
    void deleteLesson(long lessonId);

    /**
     * Retrieves all lessons.
     *
     * @return list of all lessons
     */
    List<Lesson> getAllLessons();

    /**
     * Creates multiple lessons in batch for a specific course.
     *
     * @param lessons the list of lessons to create
     * @param courseId the ID of the parent course
     * @return the list of created lessons
     * @throws tn.fiancia.financia.exception.ResourceNotFoundException if course not found
     * @throws tn.fiancia.financia.exception.ValidationException if any lesson data is invalid
     */
    List<Lesson> addAllLessons(List<Lesson> lessons, long courseId);
}


