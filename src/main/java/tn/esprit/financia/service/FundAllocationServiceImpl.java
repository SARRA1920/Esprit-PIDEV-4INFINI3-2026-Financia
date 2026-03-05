package tn.esprit.financia.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.financia.dto.AllocationMetrics;
import tn.esprit.financia.dto.FundAllocationReport;
import tn.esprit.financia.dto.PartnerContribution;
import tn.esprit.financia.entities.Fond;
import tn.esprit.financia.entities.PartenaireFond;
import tn.esprit.financia.repository.FondRepository;
import tn.esprit.financia.repository.PartenaireFondRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FundAllocationServiceImpl implements IFundAllocationService {

    private final FondRepository fondRepository;
    private final PartenaireFondRepository partenaireFondRepository;

    @Override
    public AllocationMetrics calculateMetrics(Long fondId) {
        Fond fond = fondRepository.findById(fondId)
                .orElseThrow(() -> new RuntimeException("Fund with ID " + fondId + " not found"));

        double allocationPercentage;
        if (fond.getAmount() == 0) {
            allocationPercentage = 0.0;
        } else {
            allocationPercentage = Math.round((fond.getCommittedAmount() / fond.getAmount()) * 100 * 100.0) / 100.0;
        }

        double remainingCapacity = fond.getAmount() - fond.getCommittedAmount();

        return new AllocationMetrics(
                allocationPercentage,
                remainingCapacity,
                fond.getCommittedAmount(),
                fond.getAmount()
        );
    }

    @Override
    public FundAllocationReport generateReport(Long fondId) {
        Fond fond = fondRepository.findById(fondId)
                .orElseThrow(() -> new RuntimeException("Fund with ID " + fondId + " not found"));

        AllocationMetrics metrics = calculateMetrics(fondId);

        List<PartenaireFond> commitments = partenaireFondRepository.findByFond(fond);

        List<PartnerContribution> contributions = commitments.stream()
                .map(pf -> new PartnerContribution(
                        pf.getPartenaire().getIdPartenaire(),
                        pf.getPartenaire().getName(),
                        pf.getCommittedAmount(),
                        pf.getCommitmentStatus(),
                        pf.getCommitmentDate()
                ))
                .collect(Collectors.toList());

        return new FundAllocationReport(
                fond.getIdFond(),
                fond.getName(),
                fond.getAmount(),
                fond.getCommittedAmount(),
                metrics.getAllocationPercentage(),
                metrics.getRemainingCapacity(),
                fond.getStatus(),
                contributions
        );
    }
}
