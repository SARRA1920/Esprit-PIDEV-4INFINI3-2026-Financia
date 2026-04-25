package tn.esprit.financia.service.partenaire;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.entities.partenaire.Fond;
import tn.esprit.financia.entities.partenaire.PartenaireFond;
import tn.esprit.financia.entities.partenaire.enums.CommitmentStatus;
import tn.esprit.financia.repository.partenaire.FondRepository;
import tn.esprit.financia.repository.partenaire.PartenaireFondRepository;

import java.util.Arrays;
import java.util.List;

/**
 * Implementation of IFundStatusManager for automatic fund status management.
 */
@Service
@RequiredArgsConstructor
public class FundStatusManagerImpl implements IFundStatusManager {
    
    private static final Logger log = LoggerFactory.getLogger(FundStatusManagerImpl.class);
    
    private final FondRepository fondRepository;
    private final PartenaireFondRepository partenaireFondRepository;
    
    @Override
    public void updateFundStatus(Long fondId) {
        Fond fond = fondRepository.findById(fondId)
                .orElseThrow(() -> new RuntimeException("Fund with ID " + fondId + " not found"));
        
        // Preserve CLOSED status regardless of allocation changes
        if (fond.getStatus() == Fond.FundStatus.CLOSED) {
            log.debug("Fund {} is CLOSED, status will not be updated", fondId);
            return;
        }
        
        // Update status based on allocation level
        if (fond.getCommittedAmount() >= fond.getAmount()) {
            if (fond.getStatus() != Fond.FundStatus.FULLY_ALLOCATED) {
                fond.setStatus(Fond.FundStatus.FULLY_ALLOCATED);
                fondRepository.save(fond);
                log.info("Fund {} status updated to FULLY_ALLOCATED", fondId);
            }
        } else {
            if (fond.getStatus() == Fond.FundStatus.FULLY_ALLOCATED) {
                fond.setStatus(Fond.FundStatus.AVAILABLE);
                fondRepository.save(fond);
                log.info("Fund {} status updated to AVAILABLE", fondId);
            }
        }
    }
    
    @Override
    @Transactional
    public void recalculateStatus(Long fondId) {
        Fond fond = fondRepository.findById(fondId)
                .orElseThrow(() -> new RuntimeException("Fund with ID " + fondId + " not found"));
        
        // Calculate total committedAmount excluding DEFAULTED commitments
        List<CommitmentStatus> validStatuses = Arrays.asList(
                CommitmentStatus.COMMITTED,
                CommitmentStatus.PAID
        );
        
        Double totalCommitted = partenaireFondRepository
                .sumCommittedAmountByFondAndStatuses(fondId, validStatuses);
        
        // Handle null case (no commitments)
        if (totalCommitted == null) {
            totalCommitted = 0.0;
        }
        
        // Update fund's committedAmount
        fond.setCommittedAmount(totalCommitted);
        fondRepository.save(fond);
        
        log.debug("Fund {} committedAmount recalculated to {}", fondId, totalCommitted);
        
        // Apply status transition rules
        updateFundStatus(fondId);
    }
}
