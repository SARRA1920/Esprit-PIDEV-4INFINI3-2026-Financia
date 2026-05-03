package tn.esprit.financia.repository.savings;

import tn.esprit.financia.entities.savings.SavingTransaction;
import tn.esprit.financia.entities.savings.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SavingsTransactionRepository extends JpaRepository<SavingTransaction, Long> {

    List<SavingTransaction> findBySavingsAccountId(Long accountId);

    List<SavingTransaction> findBySavingsAccountIdAndTransactionDateBetween(
            Long accountId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT t FROM SavingTransaction t WHERE t.savingsAccount.id = :accountId AND t.type = :type ORDER BY t.transactionDate ASC")
    List<SavingTransaction> findBySavingsAccountIdAndTypeOrderByTransactionDateAsc(
            @Param("accountId") Long accountId, @Param("type") TransactionType type);

    @Query("SELECT AVG(t.amount) FROM SavingTransaction t WHERE t.savingsAccount.id = :accountId AND t.type = 'DEPOSIT'")
    Double getAverageDeposit(@Param("accountId") Long accountId);

    List<SavingTransaction> findByFlaggedTrue();
}