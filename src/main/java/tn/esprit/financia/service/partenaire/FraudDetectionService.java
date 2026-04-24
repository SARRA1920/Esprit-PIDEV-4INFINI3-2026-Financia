package tn.esprit.financia.service.partenaire;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.financia.dto.partenaire.FraudDetectionResult;
import tn.esprit.financia.dto.partenaire.FraudDetectionResult.AnomalyFlag;
import tn.esprit.financia.dto.partenaire.FraudDebugInfo;
import tn.esprit.financia.entities.partenaire.Fond;
import tn.esprit.financia.entities.partenaire.Partenaire;
import tn.esprit.financia.entities.partenaire.PartenaireFond;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final IPartenaireFondService partenaireFondService;
    private final IPartenaireService partenaireService;
    private final IFondService fondService;

    /**
     * Detect fraud/anomalies for a specific partner
     */
    public FraudDetectionResult detectPartnerFraud(Long partnerId) {
        Partenaire partner = partenaireService.findById(partnerId);
        if (partner == null) {
            throw new RuntimeException("Partner not found");
        }

        List<PartenaireFond> commitments = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getPartenaire().getIdPartenaire().equals(partnerId))
                .toList();

        List<AnomalyFlag> anomalies = new ArrayList<>();
        double riskScore = 0.0;

        // Rule 1: High default rate
        long defaultCount = commitments.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("DEFAULTED"))
                .count();
        double defaultRate = commitments.isEmpty() ? 0 : (defaultCount * 100.0 / commitments.size());
        
        if (defaultRate > 30) {
            anomalies.add(new AnomalyFlag(
                    "HIGH_DEFAULT_RATE",
                    String.format("Partner has %.1f%% default rate (%d of %d commitments)", 
                            defaultRate, defaultCount, commitments.size()),
                    "HIGH",
                    defaultRate
            ));
            riskScore += 30;
        }

        // Rule 2: Unusual commitment amounts
        if (commitments.size() >= 3) {
            double avgCommitment = commitments.stream()
                    .mapToDouble(PartenaireFond::getCommittedAmount)
                    .average()
                    .orElse(0);
            
            long unusualAmounts = commitments.stream()
                    .filter(pf -> pf.getCommittedAmount() > avgCommitment * 2.5)
                    .count();
            
            if (unusualAmounts > 0 && avgCommitment > 0) {
                anomalies.add(new AnomalyFlag(
                        "UNUSUAL_COMMITMENT_AMOUNT",
                        String.format("%d commitments significantly above average (%.2f)", 
                                unusualAmounts, avgCommitment),
                        "MEDIUM",
                        20.0
                ));
                riskScore += 20;
            }
        }

        // Rule 3: Rapid multiple commitments
        long recentCommitments = commitments.stream()
                .filter(pf -> pf.getCommitmentDate() != null)
                .filter(pf -> pf.getCommitmentDate().isAfter(LocalDate.now().minusDays(7)))
                .count();
        
        if (recentCommitments > 5) {
            anomalies.add(new AnomalyFlag(
                    "RAPID_COMMITMENTS",
                    String.format("%d commitments in last 7 days", recentCommitments),
                    "MEDIUM",
                    15.0
            ));
            riskScore += 15;
        }

        // Rule 4: Late payments pattern
        long paidCommitments = commitments.stream()
                .filter(pf -> pf.getCommitmentDate() != null && pf.getPaymentDate() != null)
                .count();
        
        long latePayments = commitments.stream()
                .filter(pf -> pf.getCommitmentDate() != null && pf.getPaymentDate() != null)
                .filter(pf -> ChronoUnit.DAYS.between(pf.getCommitmentDate(), pf.getPaymentDate()) > 60)
                .count();
        
        if (paidCommitments > 0 && latePayments >= 2) {
            double lateRate = (latePayments * 100.0 / paidCommitments);
            anomalies.add(new AnomalyFlag(
                    "LATE_PAYMENT_PATTERN",
                    String.format("%d of %d payments were significantly late (%.1f%%)", 
                            latePayments, paidCommitments, lateRate),
                    "MEDIUM",
                    20.0
            ));
            riskScore += 20;
        }

        // Rule 5: Inactive then suddenly active
        if (commitments.size() >= 5) {
            LocalDate oldestCommitment = commitments.stream()
                    .filter(pf -> pf.getCommitmentDate() != null)
                    .map(PartenaireFond::getCommitmentDate)
                    .min(LocalDate::compareTo)
                    .orElse(LocalDate.now());
            
            long daysSinceFirst = ChronoUnit.DAYS.between(oldestCommitment, LocalDate.now());
            double recentActivityRate = commitments.isEmpty() ? 0 : (recentCommitments * 100.0 / commitments.size());
            
            if (daysSinceFirst > 90 && recentActivityRate > 40) {
                anomalies.add(new AnomalyFlag(
                        "SUDDEN_ACTIVITY_SPIKE",
                        String.format("Account age: %d days, but %.1f%% activity in last 7 days", 
                                daysSinceFirst, recentActivityRate),
                        "HIGH",
                        25.0
                ));
                riskScore += 25;
            }
        }

        // AI Model Integration (Placeholder - connect to your ML model)
        AIModelResult aiResult = callAIModel(partner, commitments);
        
        String riskLevel = determineRiskLevel(riskScore);
        String recommendation = generateRecommendation(riskLevel, anomalies);

        return new FraudDetectionResult(
                partnerId,
                "PARTENAIRE",
                partner.getName(),
                Math.min(riskScore, 100),
                riskLevel,
                anomalies,
                aiResult.prediction,
                aiResult.confidence,
                recommendation
        );
    }

    /**
     * Debug method to see all fraud detection calculations
     */
    public FraudDebugInfo debugPartnerFraud(Long partnerId) {
        Partenaire partner = partenaireService.findById(partnerId);
        if (partner == null) {
            throw new RuntimeException("Partner not found");
        }

        List<PartenaireFond> commitments = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getPartenaire().getIdPartenaire().equals(partnerId))
                .toList();

        // Calculate metrics
        long defaultCount = commitments.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("DEFAULTED"))
                .count();
        double defaultRate = commitments.isEmpty() ? 0 : (defaultCount * 100.0 / commitments.size());

        long recentCommitments = commitments.stream()
                .filter(pf -> pf.getCommitmentDate() != null)
                .filter(pf -> pf.getCommitmentDate().isAfter(LocalDate.now().minusDays(7)))
                .count();

        long paidCommitments = commitments.stream()
                .filter(pf -> pf.getCommitmentDate() != null && pf.getPaymentDate() != null)
                .count();

        long latePayments = commitments.stream()
                .filter(pf -> pf.getCommitmentDate() != null && pf.getPaymentDate() != null)
                .filter(pf -> ChronoUnit.DAYS.between(pf.getCommitmentDate(), pf.getPaymentDate()) > 60)
                .count();

        double avgCommitment = commitments.stream()
                .mapToDouble(PartenaireFond::getCommittedAmount)
                .average()
                .orElse(0);

        double maxCommitment = commitments.stream()
                .mapToDouble(PartenaireFond::getCommittedAmount)
                .max()
                .orElse(0);

        LocalDate oldestCommitmentDate = commitments.stream()
                .filter(pf -> pf.getCommitmentDate() != null)
                .map(PartenaireFond::getCommitmentDate)
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now());

        long accountAgeDays = ChronoUnit.DAYS.between(oldestCommitmentDate, LocalDate.now());

        // Build commitment details
        List<FraudDebugInfo.CommitmentDebug> commitmentDebugs = commitments.stream()
                .map(pf -> {
                    Long daysBetween = null;
                    boolean isLate = false;
                    if (pf.getCommitmentDate() != null && pf.getPaymentDate() != null) {
                        daysBetween = ChronoUnit.DAYS.between(pf.getCommitmentDate(), pf.getPaymentDate());
                        isLate = daysBetween > 60;
                    }
                    boolean isRecent = pf.getCommitmentDate() != null && 
                            pf.getCommitmentDate().isAfter(LocalDate.now().minusDays(7));
                    
                    return new FraudDebugInfo.CommitmentDebug(
                            pf.getId(),
                            pf.getCommittedAmount(),
                            pf.getCommitmentDate(),
                            pf.getPaymentDate(),
                            pf.getCommitmentStatus().name(),
                            daysBetween,
                            isLate,
                            isRecent
                    );
                })
                .toList();

        // Rule results
        Map<String, String> ruleResults = new java.util.HashMap<>();
        ruleResults.put("Rule1_HighDefaultRate", 
                String.format("%.1f%% (%d/%d) - Triggers if > 30%%", defaultRate, defaultCount, commitments.size()));
        ruleResults.put("Rule2_UnusualAmount", 
                String.format("Avg: %.2f, Max: %.2f, Ratio: %.2fx - Triggers if any > 2.5x avg and total >= 3", 
                        avgCommitment, maxCommitment, avgCommitment > 0 ? maxCommitment / avgCommitment : 0));
        ruleResults.put("Rule3_RapidCommitments", 
                String.format("%d in last 7 days - Triggers if > 5", recentCommitments));
        ruleResults.put("Rule4_LatePayments", 
                String.format("%d late of %d paid - Triggers if >= 2 late", latePayments, paidCommitments));
        ruleResults.put("Rule5_SuddenActivity", 
                String.format("Account age: %d days, Recent: %.1f%% - Triggers if age > 90 and recent > 40%%", 
                        accountAgeDays, commitments.isEmpty() ? 0 : (recentCommitments * 100.0 / commitments.size())));

        return new FraudDebugInfo(
                partnerId,
                partner.getName(),
                commitments.size(),
                (int) defaultCount,
                defaultRate,
                (int) recentCommitments,
                (int) paidCommitments,
                (int) latePayments,
                avgCommitment,
                maxCommitment,
                oldestCommitmentDate,
                accountAgeDays,
                commitmentDebugs,
                ruleResults
        );
    }

    /**
     * Detect fraud/anomalies for a specific commitment
     */
    public FraudDetectionResult detectCommitmentFraud(Long commitmentId) {
        PartenaireFond commitment = partenaireFondService.findById(commitmentId);
        if (commitment == null) {
            throw new RuntimeException("Commitment not found");
        }

        List<AnomalyFlag> anomalies = new ArrayList<>();
        double riskScore = 0.0;

        // Rule 1: Commitment amount vs fund capacity
        Fond fond = commitment.getFond();
        double remainingCapacity = fond.getAmount() - fond.getCommittedAmount();
        
        if (commitment.getCommittedAmount() > remainingCapacity * 0.8) {
            anomalies.add(new AnomalyFlag(
                    "LARGE_COMMITMENT",
                    String.format("Commitment (%.2f) is %.1f%% of remaining fund capacity", 
                            commitment.getCommittedAmount(),
                            (commitment.getCommittedAmount() / remainingCapacity * 100)),
                    "MEDIUM",
                    15.0
            ));
            riskScore += 15;
        }

        // Rule 2: Payment delay
        if (commitment.getCommitmentDate() != null && commitment.getPaymentDate() == null) {
            long daysSinceCommitment = ChronoUnit.DAYS.between(
                    commitment.getCommitmentDate(), 
                    LocalDate.now()
            );
            
            if (daysSinceCommitment > 90) {
                anomalies.add(new AnomalyFlag(
                        "LONG_OVERDUE",
                        String.format("Payment overdue by %d days", daysSinceCommitment),
                        "HIGH",
                        30.0
                ));
                riskScore += 30;
            } else if (daysSinceCommitment > 60) {
                anomalies.add(new AnomalyFlag(
                        "OVERDUE_PAYMENT",
                        String.format("Payment overdue by %d days", daysSinceCommitment),
                        "MEDIUM",
                        20.0
                ));
                riskScore += 20;
            }
        }

        // Rule 3: Partner history
        Partenaire partner = commitment.getPartenaire();
        List<PartenaireFond> partnerHistory = partenaireFondService.findAll().stream()
                .filter(pf -> pf.getPartenaire().getIdPartenaire().equals(partner.getIdPartenaire()))
                .toList();
        
        long partnerDefaults = partnerHistory.stream()
                .filter(pf -> pf.getCommitmentStatus().name().equals("DEFAULTED"))
                .count();
        
        if (partnerDefaults > 0) {
            anomalies.add(new AnomalyFlag(
                    "PARTNER_DEFAULT_HISTORY",
                    String.format("Partner has %d previous defaults", partnerDefaults),
                    "HIGH",
                    25.0
            ));
            riskScore += 25;
        }

        // AI Model Integration
        AIModelResult aiResult = callAIModelForCommitment(commitment);
        
        String riskLevel = determineRiskLevel(riskScore);
        String recommendation = generateRecommendation(riskLevel, anomalies);

        return new FraudDetectionResult(
                commitmentId,
                "COMMITMENT",
                partner.getName() + " - " + fond.getName(),
                Math.min(riskScore, 100),
                riskLevel,
                anomalies,
                aiResult.prediction,
                aiResult.confidence,
                recommendation
        );
    }

    /**
     * Scan all entities for fraud
     */
    public List<FraudDetectionResult> scanAllForFraud() {
        List<FraudDetectionResult> results = new ArrayList<>();

        // Scan all partners
        List<Partenaire> partners = partenaireService.findAll();
        for (Partenaire partner : partners) {
            try {
                FraudDetectionResult result = detectPartnerFraud(partner.getIdPartenaire());
                if (result.getRiskScore() > 30) { // Only include medium+ risk
                    results.add(result);
                }
            } catch (Exception e) {
                // Continue scanning
            }
        }

        // Scan high-risk commitments
        List<PartenaireFond> commitments = partenaireFondService.findAll();
        for (PartenaireFond commitment : commitments) {
            if (commitment.getCommitmentStatus().name().equals("COMMITTED") || 
                commitment.getCommitmentStatus().name().equals("ACTIVE")) {
                try {
                    FraudDetectionResult result = detectCommitmentFraud(commitment.getId());
                    if (result.getRiskScore() > 30) {
                        results.add(result);
                    }
                } catch (Exception e) {
                    // Continue scanning
                }
            }
        }

        return results.stream()
                .sorted((r1, r2) -> Double.compare(r2.getRiskScore(), r1.getRiskScore()))
                .toList();
    }

    /**
     * AI Model Integration - Replace with actual ML model call
     * Options:
     * 1. REST API call to Python Flask/FastAPI service
     * 2. TensorFlow Java API
     * 3. DL4J (DeepLearning4J)
     * 4. External AI service (AWS SageMaker, Azure ML, Google AI)
     */
    private AIModelResult callAIModel(Partenaire partner, List<PartenaireFond> commitments) {
        // TODO: Replace with actual AI model integration
        // Example: Call Python ML service
        // RestTemplate restTemplate = new RestTemplate();
        // String url = "http://localhost:5000/predict/partner";
        // Map<String, Object> request = new HashMap<>();
        // request.put("partnerId", partner.getIdPartenaire());
        // request.put("commitments", commitments);
        // AIModelResult result = restTemplate.postForObject(url, request, AIModelResult.class);
        
        // Placeholder response
        return new AIModelResult("MEDIUM_RISK", 0.65);
    }

    private AIModelResult callAIModelForCommitment(PartenaireFond commitment) {
        // TODO: Replace with actual AI model integration
        return new AIModelResult("LOW_RISK", 0.75);
    }

    private String determineRiskLevel(double score) {
        if (score >= 70) return "CRITICAL";
        if (score >= 50) return "HIGH";
        if (score >= 30) return "MEDIUM";
        return "LOW";
    }

    private String generateRecommendation(String riskLevel, List<AnomalyFlag> anomalies) {
        return switch (riskLevel) {
            case "CRITICAL" -> "IMMEDIATE ACTION REQUIRED: Suspend all transactions and conduct thorough investigation";
            case "HIGH" -> "Enhanced monitoring required. Review all recent transactions and contact partner";
            case "MEDIUM" -> "Monitor closely. Consider additional verification for new commitments";
            default -> "Continue normal monitoring";
        };
    }

    private static class AIModelResult {
        String prediction;
        double confidence;

        AIModelResult(String prediction, double confidence) {
            this.prediction = prediction;
            this.confidence = confidence;
        }
    }
}
