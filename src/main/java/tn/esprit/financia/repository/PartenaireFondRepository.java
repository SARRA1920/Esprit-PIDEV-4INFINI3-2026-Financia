package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.financia.entities.Fond;
import tn.esprit.financia.entities.PartenaireFond;
import tn.esprit.financia.entities.Partenaire;
import tn.esprit.financia.entities.enums.CommitmentStatus;

import java.util.List;

@Repository
public interface PartenaireFondRepository extends JpaRepository<PartenaireFond, Long> {
    List<PartenaireFond> findByPartenaire(Partenaire partenaire);
    
    List<PartenaireFond> findByFond(Fond fond);
    
    List<PartenaireFond> findByFondAndCommitmentStatusIn(Fond fond, List<CommitmentStatus> statuses);
    
    @Query("SELECT SUM(pf.committedAmount) FROM PartenaireFond pf " +
           "WHERE pf.fond.idFond = :fondId AND pf.commitmentStatus IN :statuses")
    Double sumCommittedAmountByFondAndStatuses(@Param("fondId") Long fondId, 
                                                @Param("statuses") List<CommitmentStatus> statuses);
}