package tn.esprit.financia.service;

import tn.esprit.financia.entities.Partenaire;
import tn.esprit.financia.entities.PartenaireFond;
import tn.esprit.financia.entities.enums.CommitmentStatus;
import tn.esprit.financia.repository.PartenaireRepository;
import tn.esprit.financia.repository.PartenaireFondRepository;
import tn.esprit.financia.dto.PartnerPerformanceMetrics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PartenaireServiceImpl implements IPartenaireService {

    @Autowired
    private PartenaireRepository partenaireRepository;

    @Autowired
    private PartenaireFondRepository partenaireFondRepository; // Inject PartenaireFondRepository

    @Override
    public List<Partenaire> findAll() {
        return partenaireRepository.findAll();
    }

    @Override
    public Partenaire findById(Long id) {
        return partenaireRepository.findById(id).orElse(null);
    }

    @Override
    public Partenaire save(Partenaire partenaire) {
        return partenaireRepository.save(partenaire);
    }

    @Override
    public void deleteById(Long id) {
        partenaireRepository.deleteById(id);
    }

    @Override
    public PartnerPerformanceMetrics getPartnerPerformanceMetrics(Long partnerId) {
        Partenaire partenaire = partenaireRepository.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found with ID: " + partnerId));

        List<PartenaireFond> partnerFonds = partenaireFondRepository.findByPartenaire(partenaire);

        double totalCommittedAmount = partnerFonds.stream()
                .mapToDouble(PartenaireFond::getCommittedAmount)
                .sum();

        long numberOfActiveFunds = partnerFonds.stream()
                .filter(pf -> pf.getCommitmentStatus() == CommitmentStatus.COMMITTED)
                .count();

        double averageCommitmentPerFund = numberOfActiveFunds > 0 ? totalCommittedAmount / numberOfActiveFunds : 0.0;

        return new PartnerPerformanceMetrics(
                partenaire.getIdPartenaire(),
                partenaire.getName(),
                totalCommittedAmount,
                numberOfActiveFunds,
                averageCommitmentPerFund
        );
    }

    @Override
    public void updatePartnerStatus(Long partnerId) {
        Partenaire partenaire = partenaireRepository.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found with ID: " + partnerId));

        List<PartenaireFond> partnerFonds = partenaireFondRepository.findByPartenaire(partenaire);

        double totalCommittedAmount = partnerFonds.stream()
                .mapToDouble(PartenaireFond::getCommittedAmount)
                .sum();

        // Define your criteria for status change
        // Example: If total committed amount falls below 1000.0, set to INACTIVE
        if (totalCommittedAmount < 1000.0) {
            partenaire.setStatus(Partenaire.PartnerStatus.INACTIVE);
            partenaireRepository.save(partenaire);
            System.out.println("Partner " + partenaire.getName() + " status updated to INACTIVE due to low committed amount.");
        } else if (partenaire.getStatus() == Partenaire.PartnerStatus.INACTIVE && totalCommittedAmount >= 1000.0) {
            // Optionally, reactivate if conditions are met again
            partenaire.setStatus(Partenaire.PartnerStatus.ACTIVE);
            partenaireRepository.save(partenaire);
            System.out.println("Partner " + partenaire.getName() + " status updated to ACTIVE due to sufficient committed amount.");
        }
        // You can add more complex logic here, e.g., checking for no new commitments over a period
    }
}