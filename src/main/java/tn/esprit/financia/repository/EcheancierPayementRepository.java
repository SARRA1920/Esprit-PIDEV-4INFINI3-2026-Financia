package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.financia.entities.EcheancierPayement;
import tn.esprit.financia.entities.enums.StatusE;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EcheancierPayementRepository extends JpaRepository<EcheancierPayement, Long> {
    List<EcheancierPayement> findByContratId(Long contratId);
    List<EcheancierPayement> findByStatus(StatusE status);
    List<EcheancierPayement> findByDueDateBeforeAndStatus(LocalDate date, StatusE status);
}
