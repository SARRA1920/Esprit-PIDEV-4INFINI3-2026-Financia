package tn.esprit.financia.service.savings;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.dto.savings.SavingsAuditLogDto;
import tn.esprit.financia.entities.savings.SavingsAuditLog;
import tn.esprit.financia.repository.savings.SavingsAuditLogRepository;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavingsAuditService {

    private final SavingsAuditLogRepository repository;

    /**
     * Journalisation « best effort » : ne doit pas faire échouer l’opération métier.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(Long userId, String action, Long accountId, Double amount, String detail) {
        try {
            SavingsAuditLog row = SavingsAuditLog.builder()
                    .userId(userId)
                    .action(action)
                    .accountId(accountId)
                    .amount(amount)
                    .detail(truncate(detail, 600))
                    .createdAt(Instant.now())
                    .build();
            repository.save(row);
        } catch (Exception e) {
            log.warn("Savings audit log skipped: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<SavingsAuditLogDto> findRecent() {
        return repository.findTop200ByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .toList();
    }

    private SavingsAuditLogDto toDto(SavingsAuditLog e) {
        return new SavingsAuditLogDto(
                e.getId(),
                e.getUserId(),
                e.getAction(),
                e.getAccountId(),
                e.getAmount(),
                e.getDetail(),
                e.getCreatedAt()
        );
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }
}
