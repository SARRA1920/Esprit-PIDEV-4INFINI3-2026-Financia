package tn.esprit.financia.service.credit;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import tn.esprit.financia.entities.credit.Credit;
import tn.esprit.financia.entities.credit.Remboursement;
import tn.esprit.financia.entities.user.User;

import java.time.format.DateTimeFormatter;

@Service
@ConditionalOnProperty(name = "sms.provider", havingValue = "twilio")
@Primary
public class TwilioSmsService implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(TwilioSmsService.class);
    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Value("${sms.enabled:false}")
    private boolean enabled;

    @Value("${twilio.account-sid:${twilio.account.sid:}}")
    private String accountSid;

    @Value("${twilio.auth-token:${twilio.auth.token:}}")
    private String authToken;

    @Value("${twilio.from-number:${twilio.phone.number:}}")
    private String fromNumber;

    private RestTemplate restTemplate;

    @PostConstruct
    void init() {
        if (!enabled) {
            log.info("SMS disabled (sms.enabled=false).");
            return;
        }
        if (isBlank(accountSid) || isBlank(authToken) || isBlank(fromNumber)) {
            log.warn("Twilio SMS enabled but not configured. Check twilio.account-sid / twilio.auth-token / twilio.from-number.");
            return;
        }
        this.restTemplate = new RestTemplate();
        log.info("Twilio SMS initialized.");
    }

    @Override
    public void sendPaymentSuccess(User user, Credit credit, Remboursement remboursement) {
        if (!enabled) return;
        if (isBlank(accountSid) || isBlank(authToken) || isBlank(fromNumber)) return;

        String to = user != null ? user.getPhone() : null;
        if (isBlank(to)) {
            log.warn("Cannot send SMS: user phone is empty. userId={}", user != null ? user.getIdUser() : null);
            return;
        }

        String amount = remboursement != null && remboursement.getAmount() != null ? remboursement.getAmount().toPlainString() : "?";
        String creditId = credit != null && credit.getId() != null ? String.valueOf(credit.getId()) : "?";
        String rembId = remboursement != null && remboursement.getId() != null ? String.valueOf(remboursement.getId()) : "?";
        String paidAt = remboursement != null && remboursement.getPaymentDate() != null ? remboursement.getPaymentDate().format(DT) : "";

        String body = "Financia: Paiement recu. Echeance #" + rembId
                + " (Credit #" + creditId + "), montant=" + amount
                + (paidAt.isBlank() ? "" : ", date=" + paidAt) + ".";

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(accountSid, authToken);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("To", to);
            form.add("From", fromNumber);
            form.add("Body", body);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);
            ResponseEntity<String> resp = restTemplate.postForEntity(url, request, String.class);

            if (!resp.getStatusCode().is2xxSuccessful()) {
                log.warn("Twilio SMS non-2xx response: status={} body={}", resp.getStatusCode(), resp.getBody());
                return;
            }
            log.info("SMS sent to={} remboursementId={}", to, rembId);
        } catch (Exception e) {
            log.error("Failed to send SMS via Twilio: {}", e.getMessage());
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}

