package tn.esprit.financia.service;

import tn.esprit.financia.entities.Partenaire;

import java.util.List;

public interface IPartenaireService {
    List<Partenaire> findAll();
    Partenaire findById(Long id);
    Partenaire save(Partenaire partenaire);
    void deleteById(Long id);
}