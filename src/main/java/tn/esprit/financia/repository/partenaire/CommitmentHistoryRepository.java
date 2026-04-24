package tn.esprit.financia.repository.partenaire;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.financia.entities.partenaire.CommitmentHistory;
import tn.esprit.financia.entities.partenaire.PartenaireFond;

import java.util.List;

@Repository
public interface CommitmentHistoryRepository extends JpaRepository<CommitmentHistory, Long> {
    List<CommitmentHistory> findByPartenaireFondOrderByRecordedAtAsc(PartenaireFond partenaireFond);
    
    List<CommitmentHistory> findByPartenaireFond_IdOrderByRecordedAtAsc(Long partenaireFondId);
}
