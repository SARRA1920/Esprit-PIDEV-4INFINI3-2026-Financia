package tn.esprit.financia.service.savings;

import tn.esprit.financia.entities.savings.SavingAccount;
import tn.esprit.financia.entities.savings.SavingTransaction;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DataQualityService {

    public DataQualityResult check(SavingTransaction tx, SavingAccount account) {
        List<String> issues = new ArrayList<>();
        double score = 100.0;

        // BIS Data Quality Checks
        if (tx.getAmount() == null || tx.getAmount() <= 0) {
            issues.add("Invalid amount (≤ 0)");
            score -= 25;
        }
        if (tx.getTransactionDate() == null || tx.getTransactionDate().isAfter(LocalDateTime.now().plusDays(1))) {
            issues.add("Future or missing transaction date");
            score -= 20;
        }
        if (tx.getDescription() == null || tx.getDescription().trim().isEmpty()) {
            issues.add("Missing description");
            score -= 15;
        }
        if (account.getBalance() < 0) {
            issues.add("Negative account balance detected");
            score -= 30;
        }

        score = Math.max(0, Math.min(100, score));

        // Print to console (visible in your logs)
        System.out.println("=== BIS DATA QUALITY CHECK ===");
        System.out.println("Transaction ID: " + tx.getId());
        System.out.println("Score: " + score + "/100");
        System.out.println("Issues: " + issues);
        System.out.println("==============================");

        return new DataQualityResult(score, issues);
    }
}