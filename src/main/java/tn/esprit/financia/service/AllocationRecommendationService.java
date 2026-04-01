package tn.esprit.financia.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.financia.dto.AllocationRecommendation;
import tn.esprit.financia.dto.AllocationRecommendation.PartenaireRecommendation;
import tn.esprit.financia.dto.FraudDetectionResult;
import tn.esprit.financia.entities.Fond;
import tn.esprit.financia.entities.Partenaire;
import tn.esprit.financia.entities.PartenaireFond;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllocationRecommendationService {

    private final IFondService fondService;
    private final IPartenaireService partenaireService;
    private final IPartenaireFondService partenaireFondService;
    private final FraudDetectionService fraudDetectionService;

    /**
     * Get AI-powered allocation recommendations for a specific fond
     */
    public AllocationRecommendation getRecommendationsForFond(Long fondId) {
        try {
            Fond fond = fondService.findById(fondId);
            if (fond == null) {
                throw new RuntimeException("Fond not found with ID: " + fondId);
            }

            double committedAmount = fond.getCommittedAmount();
            double totalAmount = fond.getAmount();

            double availableCapacity = totalAmount - committedAmount;
            double utilizationRate = totalAmount > 0 ? (committedAmount / totalAmount) * 100 : 0;

        // Get all active partenaires
        List<Partenaire> allPartenaires = partenaireService.findAll().stream()
                .filter(p -> p.getStatus().name().equals("ACTIVE"))
                .toList();

        // Analyze each partenaire and generate recommendations
        List<PartenaireRecommendation> recommendations = new ArrayList<>();
        
        for (Partenaire partenaire : allPartenaires) {
            PartenaireRecommendation rec = analyzePartenaire(partenaire, fond, availableCapacity);
            if (rec != null && rec.getRiskScore() < 70) { // Exclude critical risk partenaires
                recommendations.add(rec);
            }
        }

        // Sort by priority (performance score - risk score)
        recommendations = recommendations.stream()
                .sorted(Comparator.comparingInt(PartenaireRecommendation::getPriority))
                .limit(10) // Top 10 recommendations
                .collect(Collectors.toList());

        // Generate warnings
        List<String> warnings = generateWarnings(fond, utilizationRate, recommendations);

        // Determine allocation strategy
        String strategy = determineAllocationStrategy(utilizationRate, availableCapacity, recommendations);

        // AI confidence score (placeholder - replace with actual ML model)
        double confidenceScore = calculateConfidenceScore(recommendations);

            return new AllocationRecommendation(
                    fondId,
                    fond.getName(),
                    fond.getAmount(),
                    fond.getCommittedAmount(),
                    availableCapacity,
                    utilizationRate,
                    strategy,
                    recommendations,
                    warnings,
                    confidenceScore,
                    "v1.0-rule-based" // Replace with actual AI model version
            );
        } catch (Exception e) {
            System.err.println("Error in getRecommendationsForFond: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate recommendations for fond " + fondId + ": " + e.getMessage(), e);
        }
    }

    /**
     * Get recommendations for a specific partenaire across all fonds
     */
    public List<AllocationRecommendation> getRecommendationsForPartenaire(Long partenaireId) {
        Partenaire partenaire = partenaireService.findById(partenaireId);
        if (partenaire == null) {
            throw new RuntimeException("Partenaire not found");
        }

        // Get fraud risk for this partenaire
        double riskScore = 50.0;
        try {
            FraudDetectionResult fraudResult = fraudDetectionService.detectPartnerFraud(partenaireId);
            riskScore = fraudResult.getRiskScore();
        } catch (Exception e) {
            System.err.println("Fraud detection failed for partenaire " + partenaireId + ": " + e.getMessage());
        }
        
        if (riskScore >= 70) {
            // Critical risk - no recommendations
            return new ArrayList<>();
        }

        // Get all fonds with available capacity
        List<Fond> availableFonds = fondService.findAll().stream()
                .filter(f -> (f.getAmount() - f.getCommittedAmount()) > 0)
                .toList();

        List<AllocationRecommendation> recommendations = new ArrayList<>();
        
        for (Fond fond : availableFonds) {
            double availableCapacity = fond.getAmount() - fond.getCommittedAmount();
            PartenaireRecommendation partenaireRec = analyzePartenaire(partenaire, fond, availableCapacity);
            
            if (partenaireRec != null && partenaireRec.getRecommendedAmount() > 0) {
                AllocationRecommendation fondRec = new AllocationRecommendation();
                fondRec.setFondId(fond.getIdFond());
                fondRec.setFondName(fond.getName());
                fondRec.setTotalCapacity(fond.getAmount());
                fondRec.setCurrentCommitted(fond.getCommittedAmount());
                fondRec.setAvailableCapacity(availableCapacity);
                fondRec.setUtilizationRate((fond.getCommittedAmount() / fond.getAmount()) * 100);
                fondRec.setRecommendedPartenaires(List.of(partenaireRec));
                fondRec.setConfidenceScore(calculateConfidenceScore(List.of(partenaireRec)));
                fondRec.setAiModelVersion("v1.0-rule-based");
                
                recommendations.add(fondRec);
            }
        }

        return recommendations.stream()
                .sorted(Comparator.comparingDouble(r -> 
                    -r.getRecommendedPartenaires().get(0).getRecommendedAmount()))
                .collect(Collectors.toList());
    }

    /**
     * Analyze a partenaire and generate recommendation
     */
    private PartenaireRecommendation analyzePartenaire(Partenaire partenaire, Fond fond, double availableCapacity) {
        // Get partenaire's commitment history
        List<PartenaireFond> history = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getPartenaire().getIdPartenaire().equals(partenaire.getIdPartenaire()))
                .toList();

        if (history.isEmpty()) {
            // New partenaire - conservative recommendation
            return createNewPartenaireRecommendation(partenaire, fond, availableCapacity);
        }

        // Calculate performance metrics
        double performanceScore = calculatePerformanceScore(history);
        
        // Get fraud risk
        double riskScore = 50.0; // Default neutral risk
        String riskLevel = "MEDIUM";
        
        try {
            FraudDetectionResult fraudResult = fraudDetectionService.detectPartnerFraud(partenaire.getIdPartenaire());
            riskScore = fraudResult.getRiskScore();
            riskLevel = fraudResult.getRiskLevel();
        } catch (Exception e) {
            // If fraud detection fails, use neutral risk
            System.err.println("Fraud detection failed for partenaire " + partenaire.getIdPartenaire() + ": " + e.getMessage());
        }

        // Calculate recommended amount based on performance and risk
        double avgCommitment = history.stream()
                .mapToDouble(PartenaireFond::getCommittedAmount)
                .average()
                .orElse(0);

        double recommendedAmount = calculateRecommendedAmount(
                avgCommitment, performanceScore, riskScore, availableCapacity
        );

        double maxSafeAmount = calculateMaxSafeAmount(
                avgCommitment, performanceScore, riskScore, availableCapacity
        );

        // Generate rationale
        String rationale = generateRationale(performanceScore, riskScore, history.size());

        // Calculate priority (lower is better)
        int priority = calculatePriority(performanceScore, riskScore);

        return new PartenaireRecommendation(
                partenaire.getIdPartenaire(),
                partenaire.getName(),
                recommendedAmount,
                maxSafeAmount,
                riskLevel,
                riskScore,
                performanceScore,
                rationale,
                priority
        );
    }

    private PartenaireRecommendation createNewPartenaireRecommendation(
            Partenaire partenaire, Fond fond, double availableCapacity) {
        
        double conservativeAmount = Math.min(availableCapacity * 0.05, 50000); // 5% or 50k max
        
        return new PartenaireRecommendation(
                partenaire.getIdPartenaire(),
                partenaire.getName(),
                conservativeAmount,
                conservativeAmount * 1.5,
                "UNKNOWN",
                50.0, // Neutral risk
                50.0, // Neutral performance
                "New partenaire - conservative allocation recommended",
                5 // Medium priority
        );
    }

    private double calculatePerformanceScore(List<PartenaireFond> history) {
        double score = 100.0;

        // Penalty for defaults
        long defaultCount = history.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("DEFAULTED"))
                .count();
        double defaultRate = (defaultCount * 100.0) / history.size();
        score -= (defaultRate * 2); // -2 points per % default rate

        // Penalty for late payments
        long latePayments = history.stream()
                .filter(pf -> pf.getCommitmentDate() != null && pf.getPaymentDate() != null)
                .filter(pf -> ChronoUnit.DAYS.between(pf.getCommitmentDate(), pf.getPaymentDate()) > 60)
                .count();
        long paidCount = history.stream()
                .filter(pf -> pf.getPaymentDate() != null)
                .count();
        if (paidCount > 0) {
            double lateRate = (latePayments * 100.0) / paidCount;
            score -= (lateRate * 1.5); // -1.5 points per % late rate
        }

        // Bonus for completed commitments
        long completedCount = history.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("COMPLETED") || 
                             pf.getCommitmentStatus().name().equals("PAID"))
                .count();
        double completionRate = (completedCount * 100.0) / history.size();
        score += (completionRate * 0.5); // +0.5 points per % completion rate

        // Bonus for history length (experience)
        score += Math.min(history.size() * 2, 20); // Up to +20 for experience

        return Math.max(0, Math.min(100, score));
    }

    private double calculateRecommendedAmount(
            double avgCommitment, double performanceScore, double riskScore, double availableCapacity) {
        
        // Base amount on historical average
        double baseAmount = avgCommitment > 0 ? avgCommitment : availableCapacity * 0.1;

        // Adjust based on performance (0.5x to 1.5x)
        double performanceMultiplier = 0.5 + (performanceScore / 100.0);

        // Adjust based on risk (1.5x to 0.3x, inverse)
        double riskMultiplier = 1.5 - (riskScore / 100.0 * 1.2);

        double recommendedAmount = baseAmount * performanceMultiplier * riskMultiplier;

        // Cap at 20% of available capacity
        recommendedAmount = Math.min(recommendedAmount, availableCapacity * 0.2);

        return Math.max(0, recommendedAmount);
    }

    private double calculateMaxSafeAmount(
            double avgCommitment, double performanceScore, double riskScore, double availableCapacity) {
        
        double recommendedAmount = calculateRecommendedAmount(
                avgCommitment, performanceScore, riskScore, availableCapacity
        );

        // Max safe is 1.5x to 2x recommended, depending on risk
        double multiplier = 2.0 - (riskScore / 100.0 * 0.5);
        
        return Math.min(recommendedAmount * multiplier, availableCapacity * 0.3);
    }

    private String generateRationale(double performanceScore, double riskScore, int historySize) {
        StringBuilder rationale = new StringBuilder();

        if (performanceScore >= 80) {
            rationale.append("Excellent track record. ");
        } else if (performanceScore >= 60) {
            rationale.append("Good performance history. ");
        } else if (performanceScore >= 40) {
            rationale.append("Average performance. ");
        } else {
            rationale.append("Below average performance. ");
        }

        if (riskScore < 30) {
            rationale.append("Low risk profile. ");
        } else if (riskScore < 50) {
            rationale.append("Moderate risk. ");
        } else if (riskScore < 70) {
            rationale.append("Elevated risk - proceed with caution. ");
        } else {
            rationale.append("High risk - not recommended. ");
        }

        rationale.append(String.format("Based on %d historical commitments.", historySize));

        return rationale.toString();
    }

    private int calculatePriority(double performanceScore, double riskScore) {
        // Priority score: higher performance and lower risk = lower priority number (better)
        double priorityScore = (100 - performanceScore) + riskScore;
        
        if (priorityScore < 50) return 1; // Highest priority
        if (priorityScore < 80) return 2;
        if (priorityScore < 110) return 3;
        if (priorityScore < 140) return 4;
        return 5; // Lowest priority
    }

    private List<String> generateWarnings(Fond fond, double utilizationRate, 
                                          List<PartenaireRecommendation> recommendations) {
        List<String> warnings = new ArrayList<>();

        if (utilizationRate > 90) {
            warnings.add("CRITICAL: Fond is over 90% utilized - very limited capacity remaining");
        } else if (utilizationRate > 75) {
            warnings.add("WARNING: Fond is over 75% utilized - approaching capacity limit");
        }

        long highRiskCount = recommendations.stream()
                .filter(r -> r.getRiskScore() >= 50)
                .count();
        
        if (highRiskCount > recommendations.size() * 0.5) {
            warnings.add("WARNING: Over 50% of recommended partenaires have elevated risk");
        }

        double totalRecommended = recommendations.stream()
                .mapToDouble(PartenaireRecommendation::getRecommendedAmount)
                .sum();
        
        double availableCapacity = fond.getAmount() - fond.getCommittedAmount();
        
        if (totalRecommended > availableCapacity) {
            warnings.add("INFO: Total recommended allocations exceed available capacity - prioritize by ranking");
        }

        if (recommendations.isEmpty()) {
            warnings.add("WARNING: No suitable partenaires found for allocation");
        }

        return warnings;
    }

    private String determineAllocationStrategy(double utilizationRate, double availableCapacity,
                                               List<PartenaireRecommendation> recommendations) {
        if (utilizationRate > 90) {
            return "CONSERVATIVE - Minimal new allocations, focus on high-performance partenaires only";
        } else if (utilizationRate > 75) {
            return "SELECTIVE - Prioritize top-tier partenaires with proven track records";
        } else if (utilizationRate > 50) {
            return "BALANCED - Mix of established and new partenaires with good risk profiles";
        } else if (utilizationRate > 25) {
            return "GROWTH - Actively seek quality partenaires to increase fund utilization";
        } else {
            return "AGGRESSIVE - Maximize allocations to qualified partenaires to improve ROI";
        }
    }

    private double calculateConfidenceScore(List<PartenaireRecommendation> recommendations) {
        if (recommendations.isEmpty()) {
            return 0.0;
        }

        // Confidence based on data quality and consistency
        double avgPerformanceScore = recommendations.stream()
                .mapToDouble(PartenaireRecommendation::getPerformanceScore)
                .average()
                .orElse(50);

        double avgRiskScore = recommendations.stream()
                .mapToDouble(PartenaireRecommendation::getRiskScore)
                .average()
                .orElse(50);

        // Higher confidence when performance is high and risk is low
        double confidence = (avgPerformanceScore + (100 - avgRiskScore)) / 2;

        // Adjust for number of recommendations (more data = higher confidence)
        confidence *= Math.min(1.0, recommendations.size() / 5.0);

        return Math.min(100, confidence);
    }
}
