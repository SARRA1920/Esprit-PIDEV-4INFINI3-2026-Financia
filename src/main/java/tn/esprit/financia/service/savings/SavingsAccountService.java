package tn.esprit.financia.service.savings;

import tn.esprit.financia.entities.user.User;
import tn.esprit.financia.entities.savings.*;
import tn.esprit.financia.repository.savings.SavingsAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class SavingsAccountService {

    @Autowired
    private SavingsAccountRepository repository;

    @Autowired
    private SavingsTransactionService transactionService; // new

    @Autowired
    private SavingsAuditService auditService;

    @Value("${financia.audit.large-withdrawal-threshold:500}")
    private double largeWithdrawalThreshold;

    @Value("${financia.audit.large-deposit-threshold:2000}")
    private double largeDepositThreshold;

    // ── Create ────────────────────────────────────────────────────────────────
    public SavingAccount create(SavingAccount account, User owner) {
        account.setUser(owner);
        account.setAccountNumber(generateUniqueAccountNumber());
        account.setStatus(AccountStatus.ACTIVE);
        account.setBalance(account.getBalance() != null ? account.getBalance() : 0.0);
        account.setCreatedAt(LocalDateTime.now());

        if (AccountType.GOAL_BASED.equals(account.getType())) {
            account.setBalance(0.0);
        }

        SavingAccount saved = repository.save(account);
        auditService.log(
                owner.getIdUser(),
                "OPEN_ACCOUNT",
                saved.getId(),
                null,
                "type=" + saved.getType() + ", accountNumber=" + saved.getAccountNumber()
        );
        return saved;
    }

    // ── Read ──────────────────────────────────────────────────────────────────
    public List<SavingAccount> getAll() {
        return repository.findAll();
    }

    public Optional<SavingAccount> getById(Long id) {
        return repository.findById(id);
    }

    public List<SavingAccount> getByUser(User user) {
        return repository.findByUser(user);
    }

    // ── Update ────────────────────────────────────────────────────────────────
    public SavingAccount update(Long id, SavingAccount updated) {
        SavingAccount existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        existing.setType(updated.getType());
        return repository.save(existing);
    }

    // ── Soft delete ───────────────────────────────────────────────────────────
    public void softDelete(Long id) {
        SavingAccount account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (AccountStatus.CLOSED.equals(account.getStatus())) {
            throw new IllegalStateException("Account is already closed.");
        }
        if (account.getBalance() > 0) {
            throw new IllegalStateException(
                    "Cannot close account with remaining balance of " + account.getBalance()
                            + ". Please withdraw all funds first."
            );
        }

        account.setStatus(AccountStatus.CLOSED);
        repository.save(account);
    }

    // ── Balance operations (delegated) ───────────────────────────────────────
    public SavingAccount deposit(Long accountId, Double amount, String description) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive.");
        }
        // Ensure account exists and is active (will be checked again in transaction service)
        findActiveOrThrow(accountId);

        // Create transaction
        SavingTransaction transaction = new SavingTransaction();
        transaction.setSavingsAccount(repository.findById(accountId).orElseThrow());
        transaction.setType(TransactionType.DEPOSIT);
        transaction.setAmount(amount);
        transaction.setDescription(description);
        transactionService.create(transaction); // updates balance and goal

        if (amount >= largeDepositThreshold) {
            SavingAccount acc = repository.findById(accountId).orElseThrow();
            auditService.log(
                    acc.getUser().getIdUser(),
                    "LARGE_DEPOSIT",
                    accountId,
                    amount,
                    truncate(description, 500)
            );
        }

        return repository.findById(accountId).orElseThrow();
    }

    public SavingAccount withdraw(Long accountId, Double amount, String description) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive.");
        }
        SavingAccount account = findActiveOrThrow(accountId);
        if (AccountType.LOCKED.equals(account.getType())) {
            throw new IllegalStateException("Account is locked, withdrawals not permitted.");
        }

        SavingTransaction transaction = new SavingTransaction();
        transaction.setSavingsAccount(account);
        transaction.setType(TransactionType.WITHDRAWAL);
        transaction.setAmount(amount);
        transaction.setDescription(description);
        transactionService.create(transaction);

        if (amount >= largeWithdrawalThreshold) {
            auditService.log(
                    account.getUser().getIdUser(),
                    "LARGE_WITHDRAWAL",
                    accountId,
                    amount,
                    truncate(description, 500)
            );
        }

        return repository.findById(accountId).orElseThrow();
    }

    // ── Status management ─────────────────────────────────────────────────────
    public SavingAccount suspend(Long accountId) {
        SavingAccount account = findOrThrow(accountId);
        if (AccountStatus.CLOSED.equals(account.getStatus())) {
            throw new IllegalStateException("Cannot suspend a closed account.");
        }
        account.setStatus(AccountStatus.SUSPENDED);
        return repository.save(account);
    }

    public SavingAccount reactivate(Long accountId) {
        SavingAccount account = findOrThrow(accountId);
        if (AccountStatus.CLOSED.equals(account.getStatus())) {
            throw new IllegalStateException("Cannot reactivate a closed account.");
        }
        account.setStatus(AccountStatus.ACTIVE);
        return repository.save(account);
    }

    public SavingAccount changeStatus(Long accountId, AccountStatus newStatus) {
        SavingAccount account = findOrThrow(accountId);
        if (AccountStatus.CLOSED.equals(account.getStatus())) {
            throw new IllegalStateException("A closed account cannot change status.");
        }
        if (AccountStatus.CLOSED.equals(newStatus)) {
            throw new IllegalStateException("Use the delete endpoint to close an account.");
        }
        account.setStatus(newStatus);
        return repository.save(account);
    }

    // ── Statistics (simple) ───────────────────────────────────────────────────
    public Map<String, Object> getStatistics(Long accountId) {
        Double totalDeposits = repository.getTotalDeposits(accountId);
        return Map.of("totalDeposits", totalDeposits != null ? totalDeposits : 0.0);
    }

    // ── Public helpers for transaction service ───────────────────────────────
    public SavingAccount findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found: " + id));
    }

    public SavingAccount findActiveOrThrow(Long id) {
        SavingAccount account = findOrThrow(id);
        if (!AccountStatus.ACTIVE.equals(account.getStatus())) {
            throw new IllegalStateException(
                    "Operation not allowed — account [" + account.getAccountNumber()
                            + "] is " + account.getStatus()
            );
        }
        return account;
    }

    // ── Private helpers ───────────────────────────────────────────────────────
    private String generateUniqueAccountNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String candidate;
        do {
            String randomPart = String.format("%05d", new Random().nextInt(100000));
            candidate = "SAV-" + datePart + "-" + randomPart;
        } while (repository.existsByAccountNumber(candidate));
        return candidate;
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }
}