package tn.esprit.financia.service;

/**
 * Service interface for managing fund status based on allocation levels.
 * Automatically updates fund status when commitments change.
 */
public interface IFundStatusManager {
    
    /**
     * Updates fund status based on current allocation level.
     * Transitions to FULLY_ALLOCATED when committedAmount >= amount.
     * Transitions to AVAILABLE when committedAmount < amount (if currently FULLY_ALLOCATED).
     * Preserves CLOSED status regardless of allocation changes.
     *
     * @param fondId the ID of the fund to update
     */
    void updateFundStatus(Long fondId);
    
    /**
     * Recalculates the committedAmount by summing all PartenaireFond records
     * (excluding DEFAULTED commitments) and updates the fund status accordingly.
     *
     * @param fondId the ID of the fund to recalculate
     */
    void recalculateStatus(Long fondId);
}
