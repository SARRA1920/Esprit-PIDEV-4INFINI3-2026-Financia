package tn.fiancia.financia.repositories;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import tn.fiancia.financia.entities.Lesson;

@Repository
public interface LessonRepository extends CrudRepository<Lesson, Long> {
}
