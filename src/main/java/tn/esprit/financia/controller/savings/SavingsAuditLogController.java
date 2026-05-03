package tn.esprit.financia.controller.savings;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.financia.dto.savings.SavingsAuditLogDto;
import tn.esprit.financia.service.savings.SavingsAuditService;

import java.util.List;

@RestController
@RequestMapping("/api/savings/audit-logs")
@RequiredArgsConstructor
public class SavingsAuditLogController {

    private final SavingsAuditService auditService;

    @Operation(summary = "Journal conformité épargne (admin) — ouvertures compte, retraits sensibles, etc.")
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<SavingsAuditLogDto>> list() {
        return ResponseEntity.ok(auditService.findRecent());
    }
}
