package tn.esprit.financia.service.savings;

import tn.esprit.financia.entities.savings.*;
import tn.esprit.financia.repository.savings.SavingsAccountRepository;
import tn.esprit.financia.repository.savings.SavingsGoalRepository;
import tn.esprit.financia.repository.savings.SavingsTransactionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SavingsTransactionService {

    @Autowired
    private SavingsTransactionRepository repository;

    @Autowired
    private SavingsAccountRepository accountRepo;

    @Autowired
    private SavingsGoalRepository goalRepository;

    @Autowired
    private FraudDetectionService fraudDetectionService;

    @Autowired
    private DataQualityService dataQualityService;   // ← Added for BIS checks

    public SavingTransaction create(SavingTransaction transaction) {
        // 1. Fetch account and validate
        SavingAccount account = accountRepo.findById(transaction.getSavingsAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException(
                    "Operation not allowed — account [" + account.getAccountNumber()
                            + "] is " + account.getStatus());
        }

        transaction.setSavingsAccount(account);

        // 2. Fraud Detection (your existing service)
        FraudDetectionResult fraudResult = fraudDetectionService.analyze(transaction, account);
        transaction.setAnomalyScore(fraudResult.getScore());
        transaction.setFlagged(fraudResult.isHighRisk());

        if (fraudResult.shouldBlock()) {
            transaction.setStatus(TransactionStatus.FAILED);
            repository.save(transaction);
            throw new IllegalStateException("Transaction blocked by fraud detection. Score: "
                    + String.format("%.1f", fraudResult.getScore()));
        }

        // 3. BIS Data Quality Check (runs automatically on every transaction)
        DataQualityResult dqResult = dataQualityService.check(transaction, account);

        // 4. Normal business logic
        if (transaction.getType() == TransactionType.WITHDRAWAL) {
            if (account.getBalance() < transaction.getAmount()) {
                throw new IllegalArgumentException("Insufficient balance");
            }
            if (account.getType() == AccountType.LOCKED) {
                throw new IllegalStateException("Account is locked, withdrawals not permitted");
            }
        }

        // 5. Update account balance
        double newBalance = account.getBalance();
        if (transaction.getType() == TransactionType.DEPOSIT) {
            newBalance += transaction.getAmount();
        } else {
            newBalance -= transaction.getAmount();
        }
        account.setBalance(newBalance);
        accountRepo.save(account);

        // 6. Save transaction
        transaction.setStatus(TransactionStatus.SUCCESS);
        SavingTransaction saved = repository.save(transaction);

        // 7. Update linked goal if deposit
        if (transaction.getType() == TransactionType.DEPOSIT) {
            goalRepository.findBySavingsAccountId(account.getId())
                    .ifPresent(goal -> {
                        goal.setCurrentAmount(goal.getCurrentAmount() + transaction.getAmount());
                        double completion = (goal.getCurrentAmount() / goal.getTargetAmount()) * 100;
                        goal.setCompletionRate(completion);
                        goalRepository.save(goal);
                    });
        }

        return saved;
    }

    // ── Existing methods (kept unchanged) ─────────────────────────────────────
    public List<SavingTransaction> getAll() {
        return repository.findAll();
    }

    public Optional<SavingTransaction> getById(Long id) {
        return repository.findById(id);
    }

    public List<SavingTransaction> getByAccountId(Long accountId) {
        return repository.findBySavingsAccountId(accountId);
    }

    public List<SavingTransaction> getFlaggedTransactions() {
        return repository.findByFlaggedTrue();
    }

    public SavingTransaction update(Long id, SavingTransaction updated) {
        SavingTransaction existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        existing.setStatus(updated.getStatus());
        return repository.save(existing);
    }

    public void delete(Long id) {
        SavingTransaction transaction = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        SavingAccount account = transaction.getSavingsAccount();

        double amount = transaction.getAmount();
        if (transaction.getType() == TransactionType.DEPOSIT) {
            account.setBalance(account.getBalance() - amount);
        } else {
            account.setBalance(account.getBalance() + amount);
        }
        accountRepo.save(account);

        if (transaction.getType() == TransactionType.DEPOSIT) {
            goalRepository.findBySavingsAccountId(account.getId())
                    .ifPresent(goal -> {
                        goal.setCurrentAmount(goal.getCurrentAmount() - amount);
                        double completion = (goal.getCurrentAmount() / goal.getTargetAmount()) * 100;
                        goal.setCompletionRate(completion);
                        if (goal.getCurrentAmount() < goal.getTargetAmount()) {
                            goal.setStatus(GoalStatus.COMPLETED);
                        }
                        goalRepository.save(goal);
                    });
        }

        repository.deleteById(id);
    }
}