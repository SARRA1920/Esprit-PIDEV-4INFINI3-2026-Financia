package tn.fiancia.financia.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.fiancia.financia.entities.Course;
import tn.fiancia.financia.services.ICourseService;

import java.util.List;

@RestController
@RequestMapping("/course")
@AllArgsConstructor
public class CourseController {
    ICourseService courseService;

    @PostMapping("/addCourse")
    public Course addCourse(@RequestBody Course course) {
        return courseService.addCourse(course);
    }

    @PostMapping("/updateCourse")
    public Course updateCourse(@RequestBody Course course) {
        return courseService.updateCourse(course);
    }

    @GetMapping("/getCourse/{idCourse}")
    public Course getCourse(@PathVariable long idCourse) {
        return courseService.getCourse(idCourse);
    }

    @DeleteMapping("/deleteCourse/{idCourse}")
    public void deleteCourse(@PathVariable long idCourse) {
        courseService.deleteCourse(idCourse);
    }

    @GetMapping("/getAllCourses")
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @PostMapping("/addAllCourses")
    public List<Course> addAllCourses(@RequestBody List<Course> courses) {
        return courseService.addAllCourses(courses);
    }
}
