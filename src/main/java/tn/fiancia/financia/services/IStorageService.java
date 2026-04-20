package tn.fiancia.financia.services;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import java.nio.file.Path;
import java.util.stream.Stream;

/**
 * Service interface for file storage operations.
 * Provides methods to store, retrieve, and manage uploaded files.
 */
public interface IStorageService {

    /**
     * Initializes the storage directory structure.
     * Should be called once at application startup.
     */
    void init();

    /**
     * Stores a file in the file system organized by course and lesson.
     *
     * @param file the file to store
     * @param courseId the course ID for organization
     * @param lessonId the lesson ID for organization
     * @return the relative path to the stored file
     */
    String store(MultipartFile file, Long courseId, Long lessonId);

    /**
     * Deletes a file from the storage.
     *
     * @param filename the path to the file to delete
     */
    void delete(String filename);

    /**
     * Loads a file as a Resource for download/streaming.
     *
     * @param relativePath the relative path to the file
     * @return the Resource representing the file
     */
    Resource loadAsResource(String relativePath);

    /**
     * Gets the full path to a file.
     *
     * @param filename the filename or relative path
     * @return the full Path object
     */
    Path load(String filename);

    /**
     * Loads all stored files.
     *
     * @return stream of all file paths
     */
    Stream<Path> loadAll();
}

