package tn.esprit.financia.service;

import tn.esprit.financia.entities.CommitmentHistory;
import tn.esprit.financia.entities.enums.CommitmentStatus;

import java.time.LocalDate;
import java.util.List;

public interface ICommitmentHistoryTracker {
    CommitmentHistory recordPayment(Long partenaireFondId, double paymentAmount, 
                                     LocalDate paymentDate, CommitmentStatus previousStatus);
    
    CommitmentHistory recordStatusChange(Long partenaireFondId, CommitmentStatus previousStatus, 
                                          CommitmentStatus newStatus, String reason, LocalDate changeDate);
    
    List<CommitmentHistory> retrieveHistory(Long partenaireFondId);
}
