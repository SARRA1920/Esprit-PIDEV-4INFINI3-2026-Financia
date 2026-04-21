package tn.esprit.financia.service.formation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.financia.exception.ValidationException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.stream.Stream;

/**
 * Service implementation for file storage operations.
 * Manages file uploads and downloads using the file system.
 */
@Service
@Slf4j
public class StorageServiceImpl implements IStorageService {

    private final Path rootLocation = Paths.get("uploads"); // base folder

    @Override
    public void init() {
        log.info("Initializing storage directory at: {}", rootLocation.toAbsolutePath());
        try {
            Files.createDirectories(rootLocation);
            log.info("Storage directory initialized successfully");
        } catch (IOException e) {
            log.error("Could not initialize storage directory", e);
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @Override
    public String store(MultipartFile file, Long courseId, Long lessonId) {
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        log.info("Storing file: {} for course: {} and lesson: {}", filename, courseId, lessonId);

        try {
            if (file.isEmpty()) {
                log.warn("Attempted to store empty file: {}", filename);
                throw new ValidationException("Failed to store empty file");
            }

            // Validate file extension
            if (!isAllowedFileType(filename)) {
                log.warn("Attempted to store file with unsupported extension: {}", filename);
                throw new ValidationException("File type not allowed: " + getFileExtension(filename));
            }

            // Validate file size
            if (file.getSize() > 500L * 1024 * 1024) { // 500MB
                log.warn("File too large: {} (size: {} bytes)", filename, file.getSize());
                throw new ValidationException("File size exceeds maximum limit of 500MB");
            }

            Path lessonFolder = rootLocation.resolve(Paths.get("courses", courseId.toString(), lessonId.toString(), "file"));
            Files.createDirectories(lessonFolder);

            Path destinationFile = lessonFolder.resolve(System.currentTimeMillis() + "_" + filename);
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

            String relativeFilePath = Paths.get(
                    "courses",
                    courseId.toString(),
                    lessonId.toString(),
                    "file",
                    destinationFile.getFileName().toString()
            ).toString().replace("\\", "/");

            log.info("File stored successfully: {} -> {}", filename, relativeFilePath);
            return relativeFilePath;

        } catch (IOException e) {
            log.error("Failed to store file: {}", filename, e);
            throw new RuntimeException("Failed to store file: " + filename, e);
        }
    }

    @Override
    public void delete(String filename) {
        log.info("Deleting file: {}", filename);
        try {
            if (filename == null) {
                log.warn("Attempted to delete null file path");
                return;
            }

            Path file = Paths.get(filename);
            Files.deleteIfExists(file);
            log.info("File deleted successfully: {}", filename);
        } catch (IOException e) {
            log.error("Error deleting file: {}", filename, e);
        }
    }

    @Override
    public Resource loadAsResource(String relativePath) {
        log.debug("Loading resource: {}", relativePath);
        try {
            Path file = rootLocation.resolve(relativePath).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                log.debug("Resource loaded successfully: {}", relativePath);
                return resource;
            }

            log.warn("Resource not found or not readable: {}", relativePath);
            throw new RuntimeException("Could not read file: " + relativePath);

        } catch (MalformedURLException e) {
            log.error("Invalid file path: {}", relativePath, e);
            throw new RuntimeException("Could not read file: " + relativePath, e);
        }
    }

    @Override
    public Path load(String filename) {
        return rootLocation.resolve(filename);
    }

    @Override
    public Stream<Path> loadAll() {
        log.debug("Loading all stored files");
        try {
            return Files.walk(rootLocation, 1)
                    .filter(path -> !path.equals(rootLocation))
                    .map(rootLocation::relativize);
        } catch (IOException e) {
            log.error("Failed to read stored files", e);
            throw new RuntimeException("Failed to read stored files", e);
        }
    }

    /**
     * Checks if file extension is allowed.
     */
    private boolean isAllowedFileType(String filename) {
        if (filename == null) {
            return false;
        }
        String extension = getFileExtension(filename).toLowerCase();
        String[] allowed = {".pdf", ".doc", ".docx", ".xlsx", ".pptx", ".txt", ".jpg", ".png", ".gif", ".zip"};
        for (String ext : allowed) {
            if (extension.equals(ext)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extracts file extension from filename.
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}

