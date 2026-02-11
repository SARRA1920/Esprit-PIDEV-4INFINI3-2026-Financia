package tn.esprit.financia.service;

import tn.esprit.financia.entities.Remboursement;

import java.util.List;

public interface RemboursementService {
    Remboursement create(Remboursement remboursement, Long creditId);
    Remboursement getById(Long id);
    List<Remboursement> getAll();
    List<Remboursement> getByCredit(Long creditId);
    Remboursement update(Long id, Remboursement updated);
    void delete(Long id);
}
