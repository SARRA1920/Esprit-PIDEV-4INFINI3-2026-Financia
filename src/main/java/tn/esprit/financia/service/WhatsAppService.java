package tn.esprit.financia.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.EcheancierPayement;
import tn.esprit.financia.entities.User;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class WhatsAppService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.whatsapp.number}")
    private String twilioWhatsAppNumber;

    @Value("${twilio.whatsapp.enabled:false}")
    private boolean whatsappEnabled;

    private boolean initialized = false;

    /**
     * Initialize Twilio client
     */
    private void initializeTwilio() {
        if (!initialized && whatsappEnabled) {
            try {
                Twilio.init(accountSid, authToken);
                initialized = true;
                log.info("Twilio WhatsApp service initialized successfully");
            } catch (Exception e) {
                log.error("Failed to initialize Twilio WhatsApp: {}", e.getMessage());
                whatsappEnabled = false;
            }
        }
    }

    /**
     * Send penalty notification WhatsApp message to user
     */
    public void sendPenaltyNotification(EcheancierPayement payment, User user) {
        if (!whatsappEnabled) {
            log.info("WhatsApp sending is disabled. Would have sent WhatsApp to: {}", user.getPhone());
            logSimulatedWhatsApp(payment, user);
            return;
        }

        initializeTwilio();

        try {
            String messageBody = buildPenaltyMessage(payment, user);
            String toPhoneNumber = formatWhatsAppNumber(user.getPhone());

            Message message = Message.creator(
                    new PhoneNumber(toPhoneNumber),
                    new PhoneNumber(twilioWhatsAppNumber),
                    messageBody
            ).create();

            log.info("WhatsApp sent successfully to {} - SID: {}", toPhoneNumber, message.getSid());
        } catch (Exception e) {
            log.error("Failed to send WhatsApp to {}: {}", user.getPhone(), e.getMessage());
        }
    }

    /**
     * Send custom WhatsApp message
     */
    public void sendWhatsApp(String toPhoneNumber, String message) {
        if (!whatsappEnabled) {
            log.info("WhatsApp sending is disabled. Would have sent: {}", message);
            return;
        }

        initializeTwilio();

        try {
            String formattedNumber = formatWhatsAppNumber(toPhoneNumber);

            Message twilioMessage = Message.creator(
                    new PhoneNumber(formattedNumber),
                    new PhoneNumber(twilioWhatsAppNumber),
                    message
            ).create();

            log.info("WhatsApp sent successfully to {} - SID: {}", formattedNumber, twilioMessage.getSid());
        } catch (Exception e) {
            log.error("Failed to send WhatsApp to {}: {}", toPhoneNumber, e.getMessage());
            throw new RuntimeException("Failed to send WhatsApp: " + e.getMessage());
        }
    }

    /**
     * Build penalty notification message
     */
    private String buildPenaltyMessage(EcheancierPayement payment, User user) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String dueDate = payment.getDueDate().format(dateFormatter);

        BigDecimal totalAmount = payment.getAmountDue().add(payment.getPenaltyAmount());

        return String.format(
                "🔔 *Financia - Notification de Retard*\n\n" +
                "Bonjour *%s*,\n\n" +
                "Votre paiement du *%s* est en retard de *%d jours*.\n\n" +
                "💰 *Détails:*\n" +
                "• Montant dû: %.3f TND\n" +
                "• Pénalité: %.3f TND\n" +
                "• Total: *%.3f TND*\n\n" +
                "⚠️ Merci de régulariser votre situation rapidement pour éviter des pénalités supplémentaires.\n\n" +
                "_Financia - Votre partenaire financier_",
                user.getFirstName(),
                dueDate,
                payment.getDaysOverdue(),
                payment.getAmountDue(),
                payment.getPenaltyAmount(),
                totalAmount
        );
    }

    /**
     * Format phone number to WhatsApp format
     * WhatsApp format: whatsapp:+[country code][number]
     */
    private String formatWhatsAppNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            throw new IllegalArgumentException("Phone number cannot be empty");
        }

        // Remove spaces and special characters
        String cleaned = phoneNumber.replaceAll("[\\s\\-\\(\\)]", "");

        // Add +216 if not present (Tunisia country code)
        if (!cleaned.startsWith("+")) {
            if (cleaned.startsWith("216")) {
                cleaned = "+" + cleaned;
            } else if (cleaned.startsWith("00216")) {
                cleaned = "+" + cleaned.substring(2);
            } else {
                cleaned = "+216" + cleaned;
            }
        }

        // Add whatsapp: prefix
        return "whatsapp:" + cleaned;
    }

    /**
     * Log simulated WhatsApp for testing without Twilio
     */
    private void logSimulatedWhatsApp(EcheancierPayement payment, User user) {
        String message = buildPenaltyMessage(payment, user);
        log.info("=== SIMULATED WHATSAPP ===");
        log.info("To: {}", user.getPhone());
        log.info("Message:\n{}", message);
        log.info("==========================");
    }

    /**
     * Check if WhatsApp service is enabled and configured
     */
    public boolean isEnabled() {
        return whatsappEnabled && accountSid != null && authToken != null && twilioWhatsAppNumber != null;
    }
}
