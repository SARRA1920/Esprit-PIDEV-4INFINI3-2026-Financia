package tn.esprit.financia.service;

import tn.esprit.financia.entities.Partenaire;
import tn.esprit.financia.dto.PartnerPerformanceMetrics;

import java.util.List;

public interface IPartenaireService {
    List<Partenaire> findAll();
    Partenaire findById(Long id);
    Partenaire save(Partenaire partenaire);
    void deleteById(Long id);
    PartnerPerformanceMetrics getPartnerPerformanceMetrics(Long partnerId);
    void updatePartnerStatus(Long partnerId);
}