package tn.esprit.financia.controller.savings;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.user.User;
import tn.esprit.financia.entities.savings.AccountStatus;
import tn.esprit.financia.entities.savings.SavingAccount;
import tn.esprit.financia.security.JwtPrincipal;
import tn.esprit.financia.service.user.UserServiceImpl;
import tn.esprit.financia.service.savings.SavingsAccountService;
import tn.esprit.financia.service.savings.StatisticsService;
import tn.esprit.financia.service.savings.TwilioSmsService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/savings/accounts")
@RequiredArgsConstructor
public class SavingsAccountController {

    private final SavingsAccountService service;
    private final StatisticsService statisticsService;
    private final UserServiceImpl userService;
    private final TwilioSmsService smsService;

    // ── Helper ────────────────────────────────────────────────────────────────

    private User getCurrentUser() {
        Object principal = SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof JwtPrincipal jwtPrincipal)) {
            throw new RuntimeException("Authentication required");
        }
        return userService.getUser(jwtPrincipal.userId());
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Operation(summary = "Create a savings account — CLIENT creates their own, ADMIN can create for anyone")
    @PreAuthorize("hasAnyAuthority('CLIENT', 'ADMIN')")
    @PostMapping
    public ResponseEntity<SavingAccount> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @io.swagger.v3.oas.annotations.media.Content(
                            examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                                    value = "{ \"type\": \"CLASSIC\" }"
                            )
                    )
            )
            @Valid @RequestBody SavingAccount account) {
        User owner = getCurrentUser();
        return ResponseEntity.ok(service.create(account, owner));
    }

    @Operation(summary = "Get all accounts — CLIENT sees only their own, ADMIN/AGENT see all")
    @PreAuthorize("hasAnyAuthority('CLIENT', 'AGENT', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<SavingAccount>> getAll() {
        User currentUser = getCurrentUser();
        if ("CLIENT".equalsIgnoreCase(currentUser.getRole().name())) {
            return ResponseEntity.ok(service.getByUser(currentUser));
        }
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Get account by ID — CLIENT can only view their own")
    @PreAuthorize("hasAnyAuthority('CLIENT', 'AGENT', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<SavingAccount> getById(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        SavingAccount account = service.getById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if ("CLIENT".equalsIgnoreCase(currentUser.getRole().name())
                && !account.getUser().getIdUser().equals(currentUser.getIdUser())) {
            throw new RuntimeException("Access denied");
        }
        return ResponseEntity.ok(account);
    }

    @Operation(summary = "Update account type — ADMIN only")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<SavingAccount> update(
            @PathVariable Long id,
            @Valid @RequestBody SavingAccount account) {
        return ResponseEntity.ok(service.update(id, account));
    }

    @Operation(summary = "Close account (soft delete) — ADMIN only")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Balance operations ────────────────────────────────────────────────────

    @Operation(summary = "Deposit into account — CLIENT (own) or ADMIN")
    @PreAuthorize("hasAnyAuthority('CLIENT', 'ADMIN')")
    @PostMapping("/{id}/deposit")
    public ResponseEntity<SavingAccount> deposit(
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @io.swagger.v3.oas.annotations.media.Content(
                            examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                                    value = "{ \"amount\": 500.0, \"description\": \"monthly savings\" }"
                            )
                    )
            )
            @RequestBody Map<String, Object> body) {
        Double amount = Double.valueOf(body.get("amount").toString());
        String description = body.getOrDefault("description", "").toString();
        return ResponseEntity.ok(service.deposit(id, amount, description));
    }

    @Operation(summary = "Withdraw from account — CLIENT (own) or ADMIN")
    @PreAuthorize("hasAnyAuthority('CLIENT', 'ADMIN')")
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<SavingAccount> withdraw(
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @io.swagger.v3.oas.annotations.media.Content(
                            examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                                    value = "{ \"amount\": 200.0, \"description\": \"ATM withdrawal\" }"
                            )
                    )
            )
            @RequestBody Map<String, Object> body) {
        Double amount = Double.valueOf(body.get("amount").toString());
        String description = body.getOrDefault("description", "").toString();
        return ResponseEntity.ok(service.withdraw(id, amount, description));
    }

    // ── Status management — ADMIN only ────────────────────────────────────────

    @Operation(summary = "Suspend account — ADMIN only")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/{id}/suspend")
    public ResponseEntity<SavingAccount> suspend(@PathVariable Long id) {
        return ResponseEntity.ok(service.suspend(id));
    }

    @Operation(summary = "Reactivate account — ADMIN only")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<SavingAccount> reactivate(@PathVariable Long id) {
        return ResponseEntity.ok(service.reactivate(id));
    }

    @Operation(summary = "Change account status — ADMIN only")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<SavingAccount> changeStatus(
            @PathVariable Long id,
            @Parameter(description = "New status: ACTIVE or SUSPENDED", example = "SUSPENDED")
            @RequestParam AccountStatus status) {
        return ResponseEntity.ok(service.changeStatus(id, status));
    }

    // ── Statistics ────────────────────────────────────────────────────────────

    @Operation(summary = "Get account statistics — CLIENT (own) or ADMIN/AGENT")
    @PreAuthorize("hasAnyAuthority('CLIENT', 'AGENT', 'ADMIN')")
    @GetMapping("/{id}/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics(@PathVariable Long id) {
        return ResponseEntity.ok(statisticsService.getAccountStatistics(id));
    }

    @PreAuthorize("hasAnyAuthority('CLIENT', 'AGENT', 'ADMIN')")
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long id) {
        return ResponseEntity.ok(statisticsService.getAccountStatistics(id));
    }

    @Operation(summary = "System-wide statistics — ADMIN and AGENT only")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'AGENT')")
    @GetMapping("/system/statistics")
    public ResponseEntity<Map<String, Object>> getSystemStatistics() {
        return ResponseEntity.ok(statisticsService.getSystemStatistics());
    }

    @Operation(summary = "Generate account report — ADMIN and AGENT only")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'AGENT')")
    @GetMapping("/{id}/report")
    public ResponseEntity<String> generateReport(@PathVariable Long id) {
        return ResponseEntity.ok(statisticsService.generateAccountReport(id));
    }
    @GetMapping("/test-sms")
    public ResponseEntity<String> testSms() {
        smsService.sendSms("+21629349852", "Test SMS from Financia");
        return ResponseEntity.ok("SMS sent");
    }
}