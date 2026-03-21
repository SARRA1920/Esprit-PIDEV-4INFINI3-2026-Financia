package tn.fiancia.financia.repositories;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import tn.fiancia.financia.entities.LessonContent;

@Repository
public interface LessonContentRepository extends CrudRepository<LessonContent, Long> {
}