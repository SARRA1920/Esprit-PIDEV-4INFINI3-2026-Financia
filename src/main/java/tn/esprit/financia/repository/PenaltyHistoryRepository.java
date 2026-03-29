package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.financia.entities.PenaltyHistory;

import java.util.List;

@Repository
public interface PenaltyHistoryRepository extends JpaRepository<PenaltyHistory, Long> {
    List<PenaltyHistory> findByEcheancierIdOrderByCalculationDateDesc(Long echeancierPayementId);
}
