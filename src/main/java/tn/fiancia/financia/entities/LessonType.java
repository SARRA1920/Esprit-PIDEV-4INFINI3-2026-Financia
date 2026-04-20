package tn.fiancia.financia.entities;

/**
 * Enumeration of lesson content types.
 * Defines the different formats that a lesson can have.
 */
public enum LessonType {
    /**
     * Video content lesson.
     */
    VIDEO("Video", "Video file content"),

    /**
     * Text content lesson.
     */
    TEXT("Text", "Plain text content"),

    /**
     * Quiz/assessment lesson.
     */
    QUIZ("Quiz", "Interactive quiz or assessment"),

    /**
     * Document file content (PDF, DOCX, etc.).
     */
    FILE("File", "Document file content");

    private final String displayName;
    private final String description;

    LessonType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
