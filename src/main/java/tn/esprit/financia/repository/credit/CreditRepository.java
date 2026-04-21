package tn.esprit.financia.repository.credit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import tn.esprit.financia.entities.credit.Credit;
import tn.esprit.financia.entities.credit.StatusC;

import java.util.List;

public interface CreditRepository extends JpaRepository<Credit, Long>, JpaSpecificationExecutor<Credit> {
    List<Credit> findByUser_IdUser(Long userId);

    boolean existsByUser_IdUserAndStatus(Long userId, StatusC status);

    boolean existsByUser_IdUserAndStatusIn(Long userId, List<StatusC> statuses);
}

