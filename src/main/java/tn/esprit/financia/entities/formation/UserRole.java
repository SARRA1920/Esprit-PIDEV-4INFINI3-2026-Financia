package tn.esprit.financia.entities.formation;

/**
 * Enumeration of user roles for basic access control.
 * More detailed permission management can be added by the security team.
 */
public enum UserRole {
    /**
     * Administrator with full system access.
     */
    ADMIN("Administrator", "Full system access"),

    /**
     * Instructor who can create and manage courses.
     */
    INSTRUCTOR("Instructor", "Can create and manage courses"),

    /**
     * Student who can enroll in and view courses.
     */
    STUDENT("Student", "Can enroll in and view courses");

    private final String displayName;
    private final String description;

    UserRole(String displayName, String description) {
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
