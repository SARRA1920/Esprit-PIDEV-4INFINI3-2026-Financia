package tn.esprit.financia.service.partenaire;

import tn.esprit.financia.entities.partenaire.Fond;

import java.util.List;

public interface IFondService {
    List<Fond> findAll();
    Fond findById(Long id);
    Fond save(Fond fond);
    void deleteById(Long id);
}