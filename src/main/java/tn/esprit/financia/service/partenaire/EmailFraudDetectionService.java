package tn.esprit.financia.service.partenaire;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.financia.dto.partenaire.EmailAnalysisRequest;
import tn.esprit.financia.dto.partenaire.EmailFraudAnalysis;
import tn.esprit.financia.dto.partenaire.EmailFraudAnalysis.FraudIndicator;
import tn.esprit.financia.entities.partenaire.Partenaire;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class EmailFraudDetectionService {

    private final IPartenaireService partenaireService;

    // Suspicious keywords and patterns
    private static final String[] URGENCY_KEYWORDS = {
        "urgent", "immediately", "asap", "right now", "hurry", "quick", "fast",
        "expire", "deadline", "limited time", "act now", "don't delay"
    };

    private static final String[] FINANCIAL_SCAM_KEYWORDS = {
        "wire transfer", "bank account", "password", "pin", "credit card",
        "social security", "verify account", "confirm identity", "update payment",
        "suspended account", "unusual activity", "security alert"
    };

    private static final String[] PHISHING_KEYWORDS = {
        "click here", "verify now", "confirm now", "update now", "login here",
        "reset password", "account locked", "suspicious activity", "unauthorized access"
    };

    private static final String[] SUSPICIOUS_REQUESTS = {
        "send money", "transfer funds", "pay invoice", "outstanding balance",
        "overdue payment", "final notice", "legal action", "lawsuit", "court"
    };

    /**
     * Analyze email for fraud indicators
     */
    public EmailFraudAnalysis analyzeEmail(EmailAnalysisRequest request) {
        List<FraudIndicator> indicators = new ArrayList<>();
        double fraudScore = 0.0;

        // Get partenaire info
        Partenaire partenaire = null;
        String partenaireName = "Unknown";
        if (request.getPartenaireId() != null) {
            partenaire = partenaireService.findById(request.getPartenaireId());
            if (partenaire != null) {
                partenaireName = partenaire.getName();
            }
        }

        String emailBody = request.getBody() != null ? request.getBody().toLowerCase() : "";
        String subject = request.getSubject() != null ? request.getSubject().toLowerCase() : "";
        String combinedText = subject + " " + emailBody;

        // Rule 1: Email domain mismatch
        if (partenaire != null && request.getSenderEmail() != null) {
            String expectedDomain = extractDomain(partenaire.getEmail());
            String senderDomain = extractDomain(request.getSenderEmail());
            
            if (expectedDomain != null && !expectedDomain.isEmpty() && 
                !senderDomain.equalsIgnoreCase(expectedDomain)) {
                indicators.add(new FraudIndicator(
                    "DOMAIN_MISMATCH",
                    String.format("Sender domain '%s' doesn't match expected '%s'", senderDomain, expectedDomain),
                    "HIGH",
                    30.0,
                    "Email: " + request.getSenderEmail()
                ));
                fraudScore += 30;
            }
        }

        // Rule 2: Urgency tactics
        int urgencyCount = countKeywords(combinedText, URGENCY_KEYWORDS);
        if (urgencyCount >= 3) {
            indicators.add(new FraudIndicator(
                "URGENCY_TACTICS",
                String.format("Contains %d urgency keywords - common phishing tactic", urgencyCount),
                "MEDIUM",
                20.0,
                "Keywords found: " + urgencyCount
            ));
            fraudScore += 20;
        }

        // Rule 3: Financial information requests
        int financialCount = countKeywords(combinedText, FINANCIAL_SCAM_KEYWORDS);
        if (financialCount >= 2) {
            indicators.add(new FraudIndicator(
                "FINANCIAL_INFO_REQUEST",
                String.format("Requests sensitive financial information (%d keywords)", financialCount),
                "CRITICAL",
                40.0,
                "Suspicious financial keywords detected"
            ));
            fraudScore += 40;
        }

        // Rule 4: Phishing links/actions
        int phishingCount = countKeywords(combinedText, PHISHING_KEYWORDS);
        if (phishingCount >= 2) {
            indicators.add(new FraudIndicator(
                "PHISHING_ATTEMPT",
                String.format("Contains phishing indicators (%d keywords)", phishingCount),
                "HIGH",
                35.0,
                "Phishing patterns detected"
            ));
            fraudScore += 35;
        }

        // Rule 5: Suspicious payment requests
        int requestCount = countKeywords(combinedText, SUSPICIOUS_REQUESTS);
        if (requestCount >= 2) {
            indicators.add(new FraudIndicator(
                "SUSPICIOUS_PAYMENT_REQUEST",
                String.format("Contains suspicious payment requests (%d keywords)", requestCount),
                "HIGH",
                30.0,
                "Unusual payment request detected"
            ));
            fraudScore += 30;
        }

        // Rule 6: Suspicious attachments
        if (request.isHasAttachments() && request.getAttachmentCount() > 3) {
            indicators.add(new FraudIndicator(
                "EXCESSIVE_ATTACHMENTS",
                String.format("Unusual number of attachments (%d)", request.getAttachmentCount()),
                "MEDIUM",
                15.0,
                "Multiple attachments may contain malware"
            ));
            fraudScore += 15;
        }

        // Rule 7: Executable attachments
        if (request.getAttachmentTypes() != null) {
            for (String type : request.getAttachmentTypes()) {
                if (type.matches(".*\\.(exe|bat|cmd|scr|vbs|js)$")) {
                    indicators.add(new FraudIndicator(
                        "DANGEROUS_ATTACHMENT",
                        "Contains executable file: " + type,
                        "CRITICAL",
                        50.0,
                        "Executable files are high risk"
                    ));
                    fraudScore += 50;
                    break;
                }
            }
        }

        // Rule 8: Suspicious sender name
        if (request.getSenderName() != null && partenaire != null) {
            String senderName = request.getSenderName().toLowerCase();
            String expectedName = partenaire.getName().toLowerCase();
            
            if (!senderName.contains(expectedName) && !expectedName.contains(senderName)) {
                indicators.add(new FraudIndicator(
                    "NAME_MISMATCH",
                    String.format("Sender name '%s' doesn't match partenaire '%s'", 
                            request.getSenderName(), partenaire.getName()),
                    "MEDIUM",
                    20.0,
                    "Name inconsistency detected"
                ));
                fraudScore += 20;
            }
        }

        // Rule 9: Spelling and grammar (simple check)
        if (hasExcessiveErrors(combinedText)) {
            indicators.add(new FraudIndicator(
                "POOR_GRAMMAR",
                "Email contains excessive spelling/grammar errors - common in scams",
                "LOW",
                10.0,
                "Multiple errors detected"
            ));
            fraudScore += 10;
        }

        // Rule 10: Generic greetings
        if (emailBody.matches(".*\\b(dear (customer|user|member|sir|madam))\\b.*")) {
            indicators.add(new FraudIndicator(
                "GENERIC_GREETING",
                "Uses generic greeting instead of personal name",
                "LOW",
                10.0,
                "Impersonal communication"
            ));
            fraudScore += 10;
        }

        // AI Model Integration (placeholder)
        AIModelResult aiResult = callEmailFraudAI(request);

        // Determine fraud level
        String fraudLevel = determineFraudLevel(fraudScore);
        boolean shouldBlock = fraudScore >= 70;
        String recommendation = generateRecommendation(fraudLevel, indicators);
        String analysis = generateAnalysis(indicators, fraudScore);

        return new EmailFraudAnalysis(
            generateEmailId(),
            request.getPartenaireId(),
            partenaireName,
            request.getSenderEmail(),
            request.getSubject(),
            Math.min(fraudScore, 100),
            fraudLevel,
            indicators,
            aiResult.prediction,
            aiResult.confidence,
            recommendation,
            shouldBlock,
            analysis
        );
    }

    private int countKeywords(String text, String[] keywords) {
        int count = 0;
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                count++;
            }
        }
        return count;
    }

    private String extractDomain(String email) {
        if (email == null || !email.contains("@")) {
            return "";
        }
        return email.substring(email.indexOf("@") + 1).toLowerCase();
    }

    private boolean hasExcessiveErrors(String text) {
        // Simple heuristic: multiple consecutive spaces, excessive punctuation
        return text.matches(".*\\s{3,}.*") || 
               text.matches(".*[!?]{3,}.*") ||
               text.matches(".*[A-Z]{10,}.*"); // Excessive caps
    }

    private String determineFraudLevel(double score) {
        if (score >= 70) return "CONFIRMED_FRAUD";
        if (score >= 50) return "LIKELY_FRAUD";
        if (score >= 30) return "SUSPICIOUS";
        return "SAFE";
    }

    private String generateRecommendation(String fraudLevel, List<FraudIndicator> indicators) {
        return switch (fraudLevel) {
            case "CONFIRMED_FRAUD" -> "BLOCK IMMEDIATELY: This email shows multiple fraud indicators. Do not respond or click any links. Report to security team.";
            case "LIKELY_FRAUD" -> "HIGH RISK: Exercise extreme caution. Verify sender through official channels before taking any action. Do not provide sensitive information.";
            case "SUSPICIOUS" -> "CAUTION: This email contains suspicious elements. Verify authenticity with partenaire through known contact methods before responding.";
            default -> "Email appears legitimate but always verify requests for sensitive information or payments through official channels.";
        };
    }

    private String generateAnalysis(List<FraudIndicator> indicators, double fraudScore) {
        if (indicators.isEmpty()) {
            return "No fraud indicators detected. Email appears legitimate.";
        }

        StringBuilder analysis = new StringBuilder();
        analysis.append(String.format("Detected %d fraud indicators with total score %.1f/100:\n", 
                indicators.size(), fraudScore));

        for (FraudIndicator indicator : indicators) {
            analysis.append(String.format("- %s (%s): %s\n", 
                    indicator.getType(), indicator.getSeverity(), indicator.getDescription()));
        }

        return analysis.toString();
    }

    private String generateEmailId() {
        return "EMAIL-" + System.currentTimeMillis();
    }

    private AIModelResult callEmailFraudAI(EmailAnalysisRequest request) {
        // TODO: Integrate with NLP model for advanced email analysis
        // Could use: BERT, GPT, or specialized phishing detection models
        return new AIModelResult("SUSPICIOUS", 0.72);
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
