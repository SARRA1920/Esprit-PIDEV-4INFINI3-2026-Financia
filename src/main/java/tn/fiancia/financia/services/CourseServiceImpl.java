package tn.fiancia.financia.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.fiancia.financia.entities.Course;
import tn.fiancia.financia.repositories.CourseRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class CourseServiceImpl implements ICourseService {

    CourseRepository courseRepository;

    @Override
    public Course addCourse(Course course) {
        return courseRepository.save(course);
    }

    @Override
    public Course updateCourse(Course course) {
        return courseRepository.save(course);
    }

    @Override
    public Course getCourse(long idCourse) {
        return courseRepository.findById(idCourse).orElse(null);
    }

    @Override
    public void deleteCourse(long idCourse) {
        courseRepository.deleteById(idCourse);
    }

    @Override
    public List<Course> getAllCourses() {
        return (List<Course>) courseRepository.findAll();
    }

    @Override
    public List<Course> addAllCourses(List<Course> courses) {
        return (List<Course>) courseRepository.saveAll(courses);
    }
}

