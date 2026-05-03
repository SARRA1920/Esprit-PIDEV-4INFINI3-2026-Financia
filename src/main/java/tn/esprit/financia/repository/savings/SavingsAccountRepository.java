
package tn.esprit.financia.repository.savings;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.financia.entities.user.User;
import tn.esprit.financia.entities.savings.SavingAccount;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface SavingsAccountRepository extends JpaRepository<SavingAccount, Long> {

    /**
     *nlawej b noumrou
     * @param accountNumber noumrou lcompte
     * @return Un Optional contenant le compte s'il existe, sinon un Optional vide
     */
    Optional<SavingAccount> findByAccountNumber(String accountNumber);

    /**
     * Calcule le total des dépôts effectués sur un compte d'épargne
     * @param accountId L'identifiant du compte d'épargne
     * @return Le montant total des dépôts, ou null si aucun dépôt n'a été effectué
     */
    @Query("SELECT SUM(t.amount) FROM SavingTransaction t WHERE t.savingsAccount.id = :accountId AND t.type = 'DEPOSIT'")
    Double getTotalDeposits(@Param("accountId") Long accountId);
    @Query("SELECT SUM(t.amount) FROM SavingTransaction t WHERE t.savingsAccount.id = :accountId AND t.type = 'WITHDRAWAL'")
    Double getTotalWithdrawals(@Param("accountId") Long accountId);

    @Query("SELECT COUNT(t) FROM SavingTransaction t WHERE t.savingsAccount.id = :accountId AND MONTH(t.transactionDate) = MONTH(CURRENT_DATE)")
    Long getMonthlyTransactionCount(@Param("accountId") Long accountId);

    @Query("SELECT AVG(t.amount) FROM SavingTransaction t WHERE t.savingsAccount.id = :accountId AND t.type = 'DEPOSIT'")
    Double getAverageDeposit(@Param("accountId") Long accountId);

    List<SavingAccount> findByUser(User user);
    boolean existsByAccountNumber(String accountNumber);
}