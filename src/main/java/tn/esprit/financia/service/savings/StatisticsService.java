package tn.esprit.financia.service.savings;

import tn.esprit.financia.entities.savings.*;
import tn.esprit.financia.repository.savings.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional
public class StatisticsService {

    @Autowired
    private SavingsAccountRepository accountRepo;
    @Autowired
    private SavingsTransactionRepository transactionRepo;
    @Autowired
    private SavingsGoalRepository goalRepo;

    // Account-level statistics
    public Map<String, Object> getAccountStatistics(Long accountId) {
        Double totalDeposits = accountRepo.getTotalDeposits(accountId) != null ? accountRepo.getTotalDeposits(accountId) : 0.0;
        Double totalWithdrawals = accountRepo.getTotalWithdrawals(accountId) != null ? accountRepo.getTotalWithdrawals(accountId) : 0.0;
        Double avgDeposit = accountRepo.getAverageDeposit(accountId) != null ? accountRepo.getAverageDeposit(accountId) : 0.0;
        Long monthlyTxCount = accountRepo.getMonthlyTransactionCount(accountId) != null ? accountRepo.getMonthlyTransactionCount(accountId) : 0L;

        SavingAccount account = accountRepo.findById(accountId).orElse(null);
        Double balance = account != null ? account.getBalance() : 0.0;

        // Growth rate
        Double growthRate = totalDeposits > 0 ? ((balance - totalWithdrawals) / totalDeposits) * 100 : 0.0;

        // Liquidity ratio
        Double liquidityRatio = totalDeposits > 0 ? (totalWithdrawals / totalDeposits) * 100 : 0.0;

        // Activity level
        String activityLevel = monthlyTxCount > 10 ? "High" : monthlyTxCount > 5 ? "Medium" : "Low";

        return Map.of(
                "totalDeposits", totalDeposits,
                "totalWithdrawals", totalWithdrawals,
                "currentBalance", balance,
                "averageDeposit", avgDeposit,
                "monthlyTransactionCount", monthlyTxCount,
                "growthRatePercent", growthRate,
                "liquidityRatioPercent", liquidityRatio,
                "activityLevel", activityLevel
        );
    }

    // System-wide statistics (for admin/tutelles reports)
    public Map<String, Object> getSystemStatistics() {
        Long totalAccounts = accountRepo.count();
        Double totalSystemSavings = accountRepo.findAll().stream().mapToDouble(SavingAccount::getBalance).sum();
        Long totalGoals = goalRepo.count();

        List<SavingGoal> goals = goalRepo.findAll();
        Double avgCompletionRate = goals.isEmpty() ? 0.0 : goals.stream().mapToDouble(SavingGoal::getCompletionRate).average().orElse(0.0);

        // Active vs closed accounts
        long activeAccounts = accountRepo.findAll().stream().filter(a -> a.getStatus() == AccountStatus.ACTIVE).count();
        long closedAccounts = accountRepo.findAll().stream().filter(a -> a.getStatus() == AccountStatus.CLOSED).count();

        return Map.of(
                "totalAccounts", totalAccounts,
                "activeAccounts", activeAccounts,
                "closedAccounts", closedAccounts,
                "totalSystemSavings", totalSystemSavings,
                "totalGoals", totalGoals,
                "averageGoalCompletionRate", avgCompletionRate
        );
    }

    // Generate account report
    public String generateAccountReport(Long accountId) {
        Map<String, Object> stats = getAccountStatistics(accountId);
        return "Account Report - ID: " + accountId + " | Stats: " + stats.toString();
    }
}