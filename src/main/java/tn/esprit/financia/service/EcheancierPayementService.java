package tn.esprit.financia.service;

import tn.esprit.financia.entities.EcheancierPayement;

import java.util.List;

public interface EcheancierPayementService {
    EcheancierPayement create(EcheancierPayement echeancier, Long contratId);
    EcheancierPayement getById(Long id);
    List<EcheancierPayement> getAll();
    List<EcheancierPayement> getByContratId(Long contratId);
    EcheancierPayement update(Long id, EcheancierPayement echeancier);
    void delete(Long id);
}
