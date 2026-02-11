package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.financia.entities.Credit;

import java.util.List;

public interface CreditRepository extends JpaRepository<Credit, Long> {
    List<Credit> findByUser_IdUser(Long userId);
}
