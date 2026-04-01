package tn.esprit.financia.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${app.reset-link-base:http://localhost:3000/reset-password}")
    private String resetLinkBase;

    @Value("${spring.mail.username:noreply@financia.com}")
    private String fromEmail;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken, String userName) {
        String resetLink = resetLinkBase + "?token=" + resetToken;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Réinitialisation de votre mot de passe - Financia");
            message.setText("Bonjour " + userName + ",\n\n" +
                    "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
                    "Cliquez sur le lien suivant pour définir un nouveau mot de passe :\n" +
                    resetLink + "\n\n" +
                    "Ce lien expire dans 1 heure.\n\n" +
                    "Si vous n'avez pas fait cette demande, ignorez cet email.");
            message.setFrom(fromEmail);

            mailSender.send(message);
            log.info("Email de réinitialisation envoyé à {}", toEmail);
        } catch (Exception e) {
            log.error("Échec envoi email à {} - Erreur: {} - Lien dev: {}", toEmail, e.getMessage(), resetLink, e);
        }
    }

    public void sendSecurityAlertEmail(String toEmail, String userName, String alertMessage) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Alerte sécurité - Financia");
            message.setText("Bonjour " + userName + ",\n\n" +
                    "Une activité suspecte a été détectée sur votre compte :\n" +
                    alertMessage + "\n\n" +
                    "Si ce n'est pas vous, changez immédiatement votre mot de passe.");
            message.setFrom(fromEmail);

            mailSender.send(message);
            log.info("Email d'alerte sécurité envoyé à {}", toEmail);
        } catch (Exception e) {
            log.error("Échec envoi email d'alerte à {} - Erreur: {}", toEmail, e.getMessage(), e);
        }
    }
}
