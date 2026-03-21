package tn.fiancia.financia.services;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import java.nio.file.Path;
import java.util.stream.Stream;

public interface IStorageService {
    void init();
    String store(MultipartFile file, Long courseId, Long lessonId);
    void delete(String filename);
    Resource loadAsResource(String relativePath);
    Path load(String filename);
    Stream<Path> loadAll();
}

