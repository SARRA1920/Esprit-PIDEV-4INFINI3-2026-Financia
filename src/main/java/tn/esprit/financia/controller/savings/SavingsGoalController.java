package tn.esprit.financia.controller.savings;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.savings.AgentRequestDTO;
import tn.esprit.financia.dto.savings.GoalPredictionResult;
import tn.esprit.financia.entities.savings.SavingGoal;
import tn.esprit.financia.entities.user.User;
import tn.esprit.financia.security.JwtPrincipal;
import tn.esprit.financia.service.savings.SavingsGoalService;
import tn.esprit.financia.service.user.UserServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api/savings/goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService service;
    private final UserServiceImpl userService;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof JwtPrincipal jwtPrincipal)) {
            throw new RuntimeException("Authentication required");
        }
        return userService.getUser(jwtPrincipal.userId());
    }

    @PreAuthorize("hasAnyAuthority('CLIENT', 'ADMIN')")
    @PostMapping
    public ResponseEntity<SavingGoal> create(@Valid @RequestBody SavingGoal goal) {
        User currentUser = getCurrentUser();
        if ("CLIENT".equalsIgnoreCase(currentUser.getRole().name())) {
            Long accountId = goal.getSavingsAccount() != null ? goal.getSavingsAccount().getId() : null;
            if (accountId == null || !service.accountBelongsToUser(accountId, currentUser.getIdUser())) {
                throw new RuntimeException("Access denied");
            }
        }
        return ResponseEntity.ok(service.create(goal));
    }

    @PreAuthorize("hasAnyAuthority('CLIENT', 'AGENT', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<SavingGoal>> getAll() {
        User currentUser = getCurrentUser();
        if ("CLIENT".equalsIgnoreCase(currentUser.getRole().name())) {
            return ResponseEntity.ok(service.getAllByUser(currentUser.getIdUser()));
        }
        return ResponseEntity.ok(service.getAll());
    }

    @PreAuthorize("hasAnyAuthority('CLIENT', 'AGENT', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<SavingGoal> getById(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if ("CLIENT".equalsIgnoreCase(currentUser.getRole().name())) {
            return ResponseEntity.ok(service.getByIdAndUser(id, currentUser.getIdUser())
                    .orElseThrow(() -> new RuntimeException("Goal not found")));
        }
        return ResponseEntity.ok(service.getById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found")));
    }

    @PreAuthorize("hasAnyAuthority('CLIENT', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<SavingGoal> update(@PathVariable Long id, @Valid @RequestBody SavingGoal goal) {
        User currentUser = getCurrentUser();
        if ("CLIENT".equalsIgnoreCase(currentUser.getRole().name())) {
            service.getByIdAndUser(id, currentUser.getIdUser())
                    .orElseThrow(() -> new RuntimeException("Goal not found"));
        }
        return ResponseEntity.ok(service.update(id, goal));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── ML: Forecast ──────────────────────────────────────────────────────────
    @PreAuthorize("hasAnyAuthority('CLIENT', 'AGENT', 'ADMIN')")
    @GetMapping("/{id}/forecast")
    public ResponseEntity<GoalPredictionResult> forecast(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if ("CLIENT".equalsIgnoreCase(currentUser.getRole().name())) {
            service.getByIdAndUser(id, currentUser.getIdUser())
                    .orElseThrow(() -> new RuntimeException("Goal not found"));
        }
        return ResponseEntity.ok(service.forecast(id));
    }
    // ── AGENTIC AI COACH (Guardrails + BIS + Monte Carlo) ─────────────────────
    @PostMapping("/{id}/agent-advice")
    @PreAuthorize("hasAnyAuthority('CLIENT', 'ADMIN')")
    public ResponseEntity<String> getAgentAdvice(
            @PathVariable Long id,
            @RequestBody(required = false) AgentRequestDTO request) {
        User currentUser = getCurrentUser();
        if ("CLIENT".equalsIgnoreCase(currentUser.getRole().name())) {
            service.getByIdAndUser(id, currentUser.getIdUser())
                    .orElseThrow(() -> new RuntimeException("Goal not found"));
        }

        if (request == null) {
            request = new AgentRequestDTO();
        }
        request.setGoalId(id);

        String response = service.getAgenticAdvice(request);
        return ResponseEntity.ok(response);
    }

}
