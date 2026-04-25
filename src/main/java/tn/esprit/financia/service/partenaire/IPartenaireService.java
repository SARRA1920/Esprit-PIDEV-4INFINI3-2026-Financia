package tn.esprit.financia.service.partenaire;

import tn.esprit.financia.entities.partenaire.Partenaire;
import tn.esprit.financia.dto.partenaire.PartnerPerformanceMetrics;

import java.util.List;

public interface IPartenaireService {
    List<Partenaire> findAll();
    Partenaire findById(Long id);
    Partenaire save(Partenaire partenaire);
    void deleteById(Long id);
    PartnerPerformanceMetrics getPartnerPerformanceMetrics(Long partnerId);
    void updatePartnerStatus(Long partnerId);
}