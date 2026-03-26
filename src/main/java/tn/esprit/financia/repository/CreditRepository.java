package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.financia.entities.Credit;
import tn.esprit.financia.entities.StatusC;

import java.util.List;

public interface CreditRepository extends JpaRepository<Credit, Long> {
    List<Credit> findByUser_IdUser(Long userId);

    boolean existsByUser_IdUserAndStatus(Long userId, StatusC status);

    boolean existsByUser_IdUserAndStatusIn(Long userId, List<StatusC> statuses);
}
