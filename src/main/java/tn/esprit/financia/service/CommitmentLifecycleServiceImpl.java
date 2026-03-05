package tn.esprit.financia.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.entities.PartenaireFond;
import tn.esprit.financia.entities.enums.CommitmentStatus;
import tn.esprit.financia.exception.EntityNotFoundException;
import tn.esprit.financia.exception.InvalidInputException;
import tn.esprit.financia.exception.InvalidStatusTransitionException;
import tn.esprit.financia.repository.PartenaireFondRepository;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CommitmentLifecycleServiceImpl implements ICommitmentLifecycleService {

    private final PartenaireFondRepository partenaireFondRepository;
    private final IFundStatusManager fundStatusManager;
    private final ICommitmentHistoryTracker commitmentHistoryTracker;

    @Override
    @Transactional
    public PartenaireFond processPayment(Long partenaireFondId, double paymentAmount, LocalDate paymentDate) {
        // Validate payment amount > 0
        if (paymentAmount <= 0) {
            throw new InvalidInputException("Payment amount must be greater than zero, received: " + paymentAmount);
        }
        
        // Retrieve PartenaireFond entity
        PartenaireFond partenaireFond = partenaireFondRepository.findById(partenaireFondId)
                .orElseThrow(() -> new EntityNotFoundException("Commitment with ID " + partenaireFondId + " not found"));
        
        // Store previous status for history tracking
        CommitmentStatus previousStatus = partenaireFond.getCommitmentStatus();
        
        // Validate status transition to PAID
        if (!validateStatusTransition(previousStatus, CommitmentStatus.PAID)) {
            throw new InvalidStatusTransitionException(
                    "Cannot transition from " + previousStatus + " to PAID: invalid transition");
        }
        
        // Update commitment status and payment details
        partenaireFond.setCommitmentStatus(CommitmentStatus.PAID);
        partenaireFond.setPaymentAmount(paymentAmount);
        partenaireFond.setPaymentDate(paymentDate);
        
        // Save updated entity
        PartenaireFond savedPartenaireFond = partenaireFondRepository.save(partenaireFond);
        
        // Record payment in history
        commitmentHistoryTracker.recordPayment(partenaireFondId, paymentAmount, paymentDate, previousStatus);
        
        // Recalculate fund status
        fundStatusManager.recalculateStatus(savedPartenaireFond.getFond().getIdFond());
        
        return savedPartenaireFond;
    }

    @Override
    @Transactional
    public PartenaireFond markDefaulted(Long partenaireFondId, LocalDate defaultDate, String reason) {
        // Retrieve PartenaireFond entity
        PartenaireFond partenaireFond = partenaireFondRepository.findById(partenaireFondId)
                .orElseThrow(() -> new EntityNotFoundException("Commitment with ID " + partenaireFondId + " not found"));
        
        // Store previous status for history tracking
        CommitmentStatus previousStatus = partenaireFond.getCommitmentStatus();
        
        // Validate status transition to DEFAULTED
        if (!validateStatusTransition(previousStatus, CommitmentStatus.DEFAULTED)) {
            throw new InvalidStatusTransitionException(
                    "Cannot transition from " + previousStatus + " to DEFAULTED: invalid transition");
        }
        
        // Update commitment status and default date
        partenaireFond.setCommitmentStatus(CommitmentStatus.DEFAULTED);
        partenaireFond.setDefaultDate(defaultDate);
        
        // Save updated entity
        PartenaireFond savedPartenaireFond = partenaireFondRepository.save(partenaireFond);
        
        // Record status change in history
        commitmentHistoryTracker.recordStatusChange(partenaireFondId, previousStatus, 
                CommitmentStatus.DEFAULTED, reason, defaultDate);
        
        // Recalculate fund status
        fundStatusManager.recalculateStatus(savedPartenaireFond.getFond().getIdFond());
        
        return savedPartenaireFond;
    }

    @Override
    public boolean validateStatusTransition(CommitmentStatus from, CommitmentStatus to) {
        // Valid transitions: COMMITTED→PAID, COMMITTED→DEFAULTED, PAID→DEFAULTED
        if (from == CommitmentStatus.COMMITTED && to == CommitmentStatus.PAID) {
            return true;
        }
        if (from == CommitmentStatus.COMMITTED && to == CommitmentStatus.DEFAULTED) {
            return true;
        }
        if (from == CommitmentStatus.PAID && to == CommitmentStatus.DEFAULTED) {
            return true;
        }
        // All other transitions are invalid
        return false;
    }
}
