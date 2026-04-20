package tn.fiancia.financia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.fiancia.financia.entities.UserRole;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Data Transfer Object for User entity.
 * Used for API requests and responses to separate domain entities from API contracts.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<Long> courseIds;  // IDs of courses the user is enrolled in
}
