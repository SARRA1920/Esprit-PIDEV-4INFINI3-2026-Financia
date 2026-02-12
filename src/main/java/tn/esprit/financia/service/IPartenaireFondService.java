package tn.esprit.financia.service;

import tn.esprit.financia.entities.PartenaireFond;

import java.util.List;

public interface IPartenaireFondService {
    List<PartenaireFond> findAll();
    PartenaireFond findById(Long id);
    PartenaireFond save(PartenaireFond partenaireFond);
    void deleteById(Long id);
}