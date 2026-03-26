package tn.esprit.financia.service;

import tn.esprit.financia.entities.Remboursement;

import java.time.LocalDateTime;
import java.util.List;

public interface RemboursementService {
    Remboursement create(Remboursement remboursement, Long creditId);
    Remboursement getById(Long id);
    List<Remboursement> getAll();
    List<Remboursement> getByCredit(Long creditId);
    Remboursement update(Long id, Remboursement updated);
    Remboursement pay(Long remboursementId, LocalDateTime paymentDate);
    void delete(Long id);
}
