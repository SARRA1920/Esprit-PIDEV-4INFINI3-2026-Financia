package tn.esprit.financia.service;

import tn.esprit.financia.dto.AllocationMetrics;
import tn.esprit.financia.dto.FundAllocationReport;

public interface IFundAllocationService {
    FundAllocationReport generateReport(Long fondId);
    AllocationMetrics calculateMetrics(Long fondId);
}
