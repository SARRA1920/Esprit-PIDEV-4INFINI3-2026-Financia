package tn.esprit.financia.service.partenaire;

import tn.esprit.financia.entities.partenaire.PartenaireFond;

import java.util.List;

public interface IPartenaireFondService {
    List<PartenaireFond> findAll();
    PartenaireFond findById(Long id);
    PartenaireFond save(PartenaireFond partenaireFond);
    void deleteById(Long id);
}