package tn.esprit.financia.dto.user;

import java.time.Instant;

public record SecurityAlertResponse(
        Long id,
        String type,
        String severity,
        String message,
        String metadata,
        boolean read,
        Instant createdAt
) {}
