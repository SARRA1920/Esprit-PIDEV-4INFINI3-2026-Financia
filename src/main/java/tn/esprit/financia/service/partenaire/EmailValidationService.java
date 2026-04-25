package tn.esprit.financia.service.partenaire;

import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class EmailValidationService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    // Known fraudulent domains
    private static final String[] SUSPICIOUS_DOMAINS = {
        "tempmail.com", "guerrillamail.com", "10minutemail.com", "throwaway.email",
        "mailinator.com", "trashmail.com", "fakeinbox.com", "temp-mail.org",
        "yopmail.com", "maildrop.cc", "sharklasers.com"
    };

    // Free email providers (suspicious for business)
    private static final String[] FREE_EMAIL_PROVIDERS = {
        "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
        "aol.com", "icloud.com", "mail.com", "protonmail.com"
    };

    /**
     * Validate email format and check for fraud indicators
     */
    public EmailValidationResult validateEmail(String email, String partenaireName) {
        if (email == null || email.trim().isEmpty()) {
            return new EmailValidationResult(false, "Email is required", "INVALID", 100.0);
        }

        email = email.trim().toLowerCase();

        // Check format
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return new EmailValidationResult(false, "Invalid email format", "INVALID", 100.0);
        }

        double suspicionScore = 0.0;
        StringBuilder warnings = new StringBuilder();

        // Extract domain
        String domain = email.substring(email.indexOf("@") + 1);

        // Check for temporary/disposable email
        for (String suspiciousDomain : SUSPICIOUS_DOMAINS) {
            if (domain.equalsIgnoreCase(suspiciousDomain)) {
                return new EmailValidationResult(
                    false, 
                    "Disposable/temporary email domain detected: " + domain, 
                    "FRAUD", 
                    100.0
                );
            }
        }

        // Check for free email provider (suspicious for business)
        for (String freeProvider : FREE_EMAIL_PROVIDERS) {
            if (domain.equalsIgnoreCase(freeProvider)) {
                suspicionScore += 30.0;
                warnings.append("Free email provider used for business - suspicious. ");
                break;
            }
        }

        // Check if domain matches company name
        if (partenaireName != null && !partenaireName.isEmpty()) {
            String cleanName = partenaireName.toLowerCase()
                .replaceAll("[^a-z0-9]", "");
            String cleanDomain = domain.replaceAll("[^a-z0-9]", "");
            
            if (!cleanDomain.contains(cleanName.substring(0, Math.min(5, cleanName.length())))) {
                suspicionScore += 20.0;
                warnings.append("Email domain doesn't match company name. ");
            }
        }

        // Check for suspicious patterns
        if (email.matches(".*\\d{5,}.*")) {
            suspicionScore += 15.0;
            warnings.append("Email contains excessive numbers. ");
        }

        if (email.matches(".*[._-]{2,}.*")) {
            suspicionScore += 10.0;
            warnings.append("Email contains suspicious character patterns. ");
        }

        // Determine result
        String level;
        boolean isValid;
        String message;

        if (suspicionScore >= 70) {
            level = "FRAUD";
            isValid = false;
            message = "Email rejected: " + warnings.toString();
        } else if (suspicionScore >= 40) {
            level = "SUSPICIOUS";
            isValid = true; // Allow but warn
            message = "Email accepted with warnings: " + warnings.toString();
        } else if (suspicionScore > 0) {
            level = "CAUTION";
            isValid = true;
            message = "Email accepted: " + warnings.toString();
        } else {
            level = "VALID";
            isValid = true;
            message = "Email is valid";
        }

        return new EmailValidationResult(isValid, message, level, suspicionScore);
    }

    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class EmailValidationResult {
        private boolean valid;
        private String message;
        private String level; // VALID, CAUTION, SUSPICIOUS, FRAUD, INVALID
        private double suspicionScore;
    }
}
