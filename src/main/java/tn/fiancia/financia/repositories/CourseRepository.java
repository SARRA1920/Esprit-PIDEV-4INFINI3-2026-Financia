package tn.fiancia.financia.repositories;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import tn.fiancia.financia.entities.Course;

@Repository
public interface CourseRepository extends CrudRepository<Course, Long> {
}
