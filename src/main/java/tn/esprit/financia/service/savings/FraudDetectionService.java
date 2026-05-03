package tn.esprit.financia.service.savings;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tn.esprit.financia.dto.savings.ml.FraudRequest;
import tn.esprit.financia.dto.savings.ml.FraudResponse;
import tn.esprit.financia.entities.savings.SavingAccount;
import tn.esprit.financia.entities.savings.SavingTransaction;
import tn.esprit.financia.entities.savings.TransactionType;
import tn.esprit.financia.repository.savings.SavingsTransactionRepository;
import tn.esprit.financia.service.savings.ml.MlClientService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class FraudDetectionService {

    private static final double HIGH_RISK_THRESHOLD = 70.0;

    @Value("${fraud.ml.weight:0.4}")
    private double mlWeight;

    @Value("${fraud.rules.weight:0.6}")
    private double rulesWeight;

    @Autowired
    private SavingsTransactionRepository transactionRepo;

    @Autowired
    private MlClientService mlClientService;

    public FraudDetectionResult analyze(SavingTransaction tx, SavingAccount account) {
        RuleBasedResult ruleResult = computeRuleBasedScore(tx, account);

        FraudResponse mlResponse = mlClientService.analyzeFraud(buildFraudRequest(tx, account));

        double combinedScore;
        List<String> allReasons = new ArrayList<>(ruleResult.reasons);

        if (mlResponse != null && mlResponse.getScore() >= 0) {
            combinedScore = (mlResponse.getScore() * mlWeight) + (ruleResult.score * rulesWeight);
            if (mlResponse.getReasons() != null) {
                allReasons.addAll(mlResponse.getReasons());
            }
        } else {
            combinedScore = ruleResult.score;
            allReasons.add("ML service unavailable - using rule-based detection");
        }

        boolean highRisk = combinedScore >= HIGH_RISK_THRESHOLD;
        return new FraudDetectionResult(combinedScore, highRisk, allReasons);
    }

    private RuleBasedResult computeRuleBasedScore(SavingTransaction tx, SavingAccount account) {
        List<String> reasons = new ArrayList<>();
        double score = 0.0;

        Double avgDeposit = transactionRepo.getAverageDeposit(account.getId());
        if (avgDeposit != null && avgDeposit > 0 && tx.getAmount() > avgDeposit * 3) {
            score += 35;
            reasons.add("Amount 3x higher than average deposit");
        }

        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentTxCount = transactionRepo.findBySavingsAccountIdAndTransactionDateBetween(
                account.getId(), oneHourAgo, LocalDateTime.now()).size();
        if (recentTxCount >= 4) {
            score += 30;
            reasons.add("High transaction velocity: " + recentTxCount + " tx in last hour");
        }

        int hour = LocalDateTime.now().getHour();
        if (hour >= 0 && hour <= 6) {
            score += 15;
            reasons.add("Transaction occurred during unusual hours (night)");
        }

        if (tx.getType() == TransactionType.WITHDRAWAL) {
            List<SavingTransaction> lastDeposits = transactionRepo.findBySavingsAccountIdAndTypeOrderByTransactionDateAsc(
                    account.getId(), TransactionType.DEPOSIT);
            if (!lastDeposits.isEmpty() && lastDeposits.get(lastDeposits.size() - 1).getAmount() * 0.8 > tx.getAmount()) {
                score += 25;
                reasons.add("Large withdrawal immediately after a big deposit");
            }
        }

        if (account.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7)) && tx.getAmount() > 1000) {
            score += 20;
            reasons.add("Large first transaction on recently created account");
        }

        score = Math.min(95.0, Math.max(0.0, score));
        return new RuleBasedResult(score, reasons);
    }

    private FraudRequest buildFraudRequest(SavingTransaction tx, SavingAccount account) {
        FraudRequest request = new FraudRequest();
        request.setAccountId(account.getId());

        FraudRequest.TransactionInfo txInfo = new FraudRequest.TransactionInfo();
        txInfo.setAmount(tx.getAmount());
        txInfo.setType(tx.getType().name());
        txInfo.setTimestamp(tx.getTransactionDate());
        request.setTransaction(txInfo);

        List<SavingTransaction> history = transactionRepo.findBySavingsAccountIdAndTypeOrderByTransactionDateAsc(
                        account.getId(), TransactionType.DEPOSIT).stream()
                .limit(10)
                .toList();

        List<FraudRequest.TransactionHistory> hist = history.stream()
                .map(t -> {
                    FraudRequest.TransactionHistory h = new FraudRequest.TransactionHistory();
                    h.setAmount(t.getAmount());
                    h.setTimestamp(t.getTransactionDate());
                    h.setType(t.getType().name());
                    return h;
                })
                .toList();
        request.setHistory(hist);
        return request;
    }

    private static class RuleBasedResult {
        double score;
        List<String> reasons;
        RuleBasedResult(double score, List<String> reasons) {
            this.score = score;
            this.reasons = reasons;
        }
    }
}