package tn.esprit.financia.repository.savings;

import tn.esprit.financia.entities.savings.SavingGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SavingsGoalRepository extends JpaRepository<SavingGoal, Long> {
    Optional<SavingGoal> findBySavingsAccountId(Long accountId);
    List<SavingGoal> findAllBySavingsAccount_User_IdUser(Long userId);
    Optional<SavingGoal> findByIdAndSavingsAccount_User_IdUser(Long id, Long userId);
}
