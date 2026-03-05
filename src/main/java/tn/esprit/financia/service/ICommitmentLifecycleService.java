package tn.esprit.financia.service;

import tn.esprit.financia.entities.PartenaireFond;
import tn.esprit.financia.entities.enums.CommitmentStatus;

import java.time.LocalDate;

public interface ICommitmentLifecycleService {
    PartenaireFond processPayment(Long partenaireFondId, double paymentAmount, LocalDate paymentDate);
    PartenaireFond markDefaulted(Long partenaireFondId, LocalDate defaultDate, String reason);
    boolean validateStatusTransition(CommitmentStatus from, CommitmentStatus to);
}
