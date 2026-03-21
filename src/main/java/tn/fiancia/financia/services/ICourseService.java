package tn.fiancia.financia.services;

import tn.fiancia.financia.entities.Course;

import java.util.List;

public interface ICourseService {

    public Course addCourse(Course course);
    public Course updateCourse(Course course);
    public Course getCourse(long idCourse);
    public void deleteCourse(long idCourse);
    public List<Course> getAllCourses();
    public List<Course> addAllCourses(List<Course> courses);
}

