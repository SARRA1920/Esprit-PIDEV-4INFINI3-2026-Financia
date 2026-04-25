package tn.esprit.financia.service.partenaire;

import tn.esprit.financia.dto.partenaire.AllocationMetrics;
import tn.esprit.financia.dto.partenaire.FundAllocationReport;

public interface IFundAllocationService {
    FundAllocationReport generateReport(Long fondId);
    AllocationMetrics calculateMetrics(Long fondId);
}
