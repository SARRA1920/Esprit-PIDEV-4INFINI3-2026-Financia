package tn.esprit.financia.exception;

/**
 * Enum for standardized error codes across the application.
 */
public enum ErrorCode {
    RESOURCE_NOT_FOUND("ERR_001", "Resource not found"),
    VALIDATION_ERROR("ERR_002", "Validation failed"),
    INVALID_INPUT("ERR_003", "Invalid input parameters"),
    INTERNAL_SERVER_ERROR("ERR_500", "Internal server error"),
    FILE_OPERATION_ERROR("ERR_004", "File operation failed"),
    TRANSLATION_ERROR("ERR_005", "Translation service error"),
    QUIZ_GENERATION_ERROR("ERR_006", "Quiz generation failed");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
