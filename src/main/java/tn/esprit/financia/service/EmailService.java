package tn.esprit.financia.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import tn.esprit.financia.entities.Contrat;
import tn.esprit.financia.entities.User;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public void sendContractEmail(Contrat contrat, User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("arifaanas83@gmail.com");
            helper.setTo(user.getEmail());
            helper.setSubject("🎉 Your Loan Contract is Ready - Financia");

            Context context = new Context();
            context.setVariable("customerName", user.getFirstName() + " " + user.getLastName());
            context.setVariable("contractId", contrat.getId());
            context.setVariable("amount", contrat.getAmount());
            context.setVariable("rate", contrat.getRate());
            context.setVariable("duration", contrat.getDuration());
            context.setVariable("signedDate", contrat.getSignedDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            context.setVariable("status", contrat.getStatus());
            context.setVariable("type", contrat.getType());
            context.setVariable("version", contrat.getVersion());
            
            // Currency information
            String currency = contrat.getCurrency() != null ? contrat.getCurrency() : "TND";
            context.setVariable("currency", currency);
            context.setVariable("isForeignCurrency", !currency.equalsIgnoreCase("TND"));
            context.setVariable("originalAmount", contrat.getOriginalAmount());
            context.setVariable("amountInTND", contrat.getAmountInTND());
            context.setVariable("exchangeRate", contrat.getExchangeRateUsed());

            String htmlContent = templateEngine.process("contract-email", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Contract email sent successfully to: {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send contract email to: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}
