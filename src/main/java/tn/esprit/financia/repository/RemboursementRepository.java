package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.financia.entities.Remboursement;

import java.util.List;

public interface RemboursementRepository extends JpaRepository<Remboursement, Long> {
    List<Remboursement> findByCredit_Id(Long creditId);
}
