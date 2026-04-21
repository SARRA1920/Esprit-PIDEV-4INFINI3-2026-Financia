package tn.esprit.financia.validator;

import tn.esprit.financia.exception.ValidationException;
import tn.esprit.financia.util.AppConstants;

/**
 * Validation utility class providing common validation methods.
 * Centralizes validation logic to ensure consistency across the application.
 */
public class ValidationUtils {

    private ValidationUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Validates that a string is not null or empty.
     */
    public static void validateNotEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException(fieldName + " cannot be empty");
        }
    }

    /**
     * Validates that a string meets length requirements.
     */
    public static void validateStringLength(String value, String fieldName, int minLength, int maxLength) {
        if (value == null) {
            return;
        }
        if (value.length() < minLength || value.length() > maxLength) {
            throw new ValidationException(String.format(
                    "%s must be between %d and %d characters", fieldName, minLength, maxLength));
        }
    }

    /**
     * Validates course title.
     */
    public static void validateCourseTitle(String title) {
        validateNotEmpty(title, "Course title");
        validateStringLength(title, "Course title", 
                AppConstants.MIN_TITLE_LENGTH, AppConstants.MAX_TITLE_LENGTH);
    }

    /**
     * Validates course description.
     */
    public static void validateCourseDescription(String description) {
        if (description != null) {
            validateStringLength(description, "Course description",
                    AppConstants.MIN_DESCRIPTION_LENGTH, AppConstants.MAX_DESCRIPTION_LENGTH);
        }
    }

    /**
     * Validates lesson title.
     */
    public static void validateLessonTitle(String title) {
        validateNotEmpty(title, "Lesson title");
        validateStringLength(title, "Lesson title",
                AppConstants.MIN_TITLE_LENGTH, AppConstants.MAX_TITLE_LENGTH);
    }

    /**
     * Validates that a numeric ID is positive.
     */
    public static void validatePositiveId(Long id, String fieldName) {
        if (id == null || id <= 0) {
            throw new ValidationException(fieldName + " must be a positive number");
        }
    }

    /**
     * Validates that text content is not empty and within size limits.
     */
    public static void validateTextContent(String content) {
        if (content != null && content.trim().length() > 0) {
            if (content.length() > 1000000) { // 1MB limit for text
                throw new ValidationException("Text content exceeds maximum size");
            }
        }
    }

    /**
     * Validates that a supported language code is provided.
     */
    public static void validateLanguageCode(String languageCode) {
        if (languageCode == null || !isValidLanguage(languageCode)) {
            throw new ValidationException("Unsupported language: " + languageCode);
        }
    }

    /**
     * Checks if a language code is supported.
     */
    public static boolean isValidLanguage(String languageCode) {
        if (languageCode == null) {
            return false;
        }
        for (String supported : AppConstants.SUPPORTED_LANGUAGES) {
            if (supported.equalsIgnoreCase(languageCode)) {
                return true;
            }
        }
        return false;
    }
}
