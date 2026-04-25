package tn.esprit.financia.service.partenaire;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.entities.partenaire.CommitmentHistory;
import tn.esprit.financia.entities.partenaire.PartenaireFond;
import tn.esprit.financia.entities.partenaire.enums.CommitmentStatus;
import tn.esprit.financia.repository.partenaire.CommitmentHistoryRepository;
import tn.esprit.financia.repository.partenaire.PartenaireFondRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommitmentHistoryTrackerImpl implements ICommitmentHistoryTracker {
    
    private final CommitmentHistoryRepository commitmentHistoryRepository;
    private final PartenaireFondRepository partenaireFondRepository;

    @Override
    @Transactional
    public CommitmentHistory recordPayment(Long partenaireFondId, double paymentAmount, 
                                            LocalDate paymentDate, CommitmentStatus previousStatus) {
        PartenaireFond partenaireFond = partenaireFondRepository.findById(partenaireFondId)
                .orElseThrow(() -> new RuntimeException("PartenaireFond not found with id: " + partenaireFondId));
        
        CommitmentHistory history = new CommitmentHistory();
        history.setPartenaireFond(partenaireFond);
        history.setPreviousStatus(previousStatus);
        history.setNewStatus(CommitmentStatus.PAID);
        history.setEventType(CommitmentHistory.HistoryEventType.PAYMENT_PROCESSED);
        history.setPaymentAmount(paymentAmount);
        history.setEventDate(paymentDate);
        
        return commitmentHistoryRepository.save(history);
    }

    @Override
    @Transactional
    public CommitmentHistory recordStatusChange(Long partenaireFondId, CommitmentStatus previousStatus, 
                                                 CommitmentStatus newStatus, String reason, LocalDate changeDate) {
        PartenaireFond partenaireFond = partenaireFondRepository.findById(partenaireFondId)
                .orElseThrow(() -> new RuntimeException("PartenaireFond not found with id: " + partenaireFondId));
        
        CommitmentHistory history = new CommitmentHistory();
        history.setPartenaireFond(partenaireFond);
        history.setPreviousStatus(previousStatus);
        history.setNewStatus(newStatus);
        history.setEventType(newStatus == CommitmentStatus.DEFAULTED 
                ? CommitmentHistory.HistoryEventType.COMMITMENT_DEFAULTED 
                : CommitmentHistory.HistoryEventType.STATUS_CHANGED);
        history.setReason(reason);
        history.setEventDate(changeDate);
        
        return commitmentHistoryRepository.save(history);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommitmentHistory> retrieveHistory(Long partenaireFondId) {
        // Validate PartenaireFond exists
        if (!partenaireFondRepository.existsById(partenaireFondId)) {
            throw new RuntimeException("PartenaireFond not found with id: " + partenaireFondId);
        }
        
        return commitmentHistoryRepository.findByPartenaireFond_IdOrderByRecordedAtAsc(partenaireFondId);
    }
}
