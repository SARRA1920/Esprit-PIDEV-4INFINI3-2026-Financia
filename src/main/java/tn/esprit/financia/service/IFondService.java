package tn.esprit.financia.service;

import tn.esprit.financia.entities.Fond;

import java.util.List;

public interface IFondService {
    List<Fond> findAll();
    Fond findById(Long id);
    Fond save(Fond fond);
    void deleteById(Long id);
}