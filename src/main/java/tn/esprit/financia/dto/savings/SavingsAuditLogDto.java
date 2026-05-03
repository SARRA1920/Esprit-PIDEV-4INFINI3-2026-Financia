package tn.esprit.financia.dto.savings;

import java.time.Instant;

public record SavingsAuditLogDto(
        Long id,
        Long userId,
        String action,
        Long accountId,
        Double amount,
        String detail,
        Instant createdAt
) {}
