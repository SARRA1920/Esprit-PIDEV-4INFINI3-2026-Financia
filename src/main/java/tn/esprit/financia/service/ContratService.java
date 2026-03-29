package tn.esprit.financia.service;

import tn.esprit.financia.entities.Contrat;

import java.util.List;

public interface ContratService {
    Contrat create(Contrat contrat, Long creditId);
    Contrat getById(Long id);
    List<Contrat> getAll();
    Contrat getByCreditId(Long creditId);
    Contrat update(Long id, Contrat contrat);
    void delete(Long id);
}
