package tn.fiancia.financia.util;

/**
 * Application constants and configuration values.
 * Centralizes all magic strings and numeric constants used throughout the application.
 */
public final class AppConstants {

    private AppConstants() {
        // Private constructor to prevent instantiation
    }

    // API Constants
    public static final String API_BASE_PATH = "/f";
    public static final String USERS_ENDPOINT = "/user";
    public static final String COURSES_ENDPOINT = "/course";
    public static final String LESSONS_ENDPOINT = "/lesson";
    public static final String LESSON_CONTENT_ENDPOINT = "/lesson-content";
    public static final String AI_ENDPOINT = "/ai";
    public static final String RECOMMENDATION_ENDPOINT = "/recommendation";
    public static final String TRANSLATION_ENDPOINT = "/translation";
    public static final String FILE_ENDPOINT = "/file";

    // File Upload Constants
    public static final String UPLOAD_BASE_PATH = "uploads/";
    public static final String COURSE_UPLOAD_PATH = "uploads/courses/";
    public static final long MAX_FILE_SIZE = 500L * 1024 * 1024; // 500MB
    public static final String[] ALLOWED_FILE_EXTENSIONS = {".pdf", ".doc", ".docx", ".xlsx", ".pptx", ".txt", ".jpg", ".png"};

    // Pagination Constants
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    // Recommendation Constants
    public static final int DEFAULT_RECOMMENDATION_LIMIT = 10;
    public static final int MAX_RECOMMENDATION_LIMIT = 50;

    // Translation Constants
    public static final String DEFAULT_LANGUAGE = "en";
    public static final String[] SUPPORTED_LANGUAGES = {"en", "fr", "ar"};
    public static final String MYMEMORY_API_URL = "https://api.mymemory.translated.net/get";

    // Validation Constants
    public static final int MIN_TITLE_LENGTH = 3;
    public static final int MAX_TITLE_LENGTH = 255;
    public static final int MIN_DESCRIPTION_LENGTH = 10;
    public static final int MAX_DESCRIPTION_LENGTH = 1000;

    // HTTP Headers
    public static final String CONTENT_TYPE_JSON = "application/json";
    public static final String CONTENT_DISPOSITION_INLINE = "inline";
    public static final String CONTENT_DISPOSITION_ATTACHMENT = "attachment";

    // Error Messages
    public static final String RESOURCE_NOT_FOUND_MESSAGE = "%s with id %s not found";
    public static final String VALIDATION_FAILED_MESSAGE = "Validation failed: %s";
    public static final String INTERNAL_ERROR_MESSAGE = "An unexpected error occurred";
}
