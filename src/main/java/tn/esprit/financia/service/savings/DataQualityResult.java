package tn.esprit.financia.service.savings;

import java.util.List;

public record DataQualityResult(double score, List<String> issues) {}