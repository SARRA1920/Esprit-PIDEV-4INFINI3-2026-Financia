package tn.esprit.financia.controller.savings;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.financia.repository.savings.SavingsAccountRepository;
import tn.esprit.financia.repository.savings.SavingsGoalRepository;
import tn.esprit.financia.repository.savings.SavingsTransactionRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/savings/stats")
public class SavingsStatsController {

    private final SavingsAccountRepository savingsAccountRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final SavingsTransactionRepository savingsTransactionRepository;

    public SavingsStatsController(SavingsAccountRepository savingsAccountRepository,
                                  SavingsGoalRepository savingsGoalRepository,
                                  SavingsTransactionRepository savingsTransactionRepository) {
        this.savingsAccountRepository = savingsAccountRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.savingsTransactionRepository = savingsTransactionRepository;
    }

    @GetMapping
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("accounts", savingsAccountRepository.count());
        stats.put("goals", savingsGoalRepository.count());
        stats.put("transactions", savingsTransactionRepository.count());
        return stats;
    }
}