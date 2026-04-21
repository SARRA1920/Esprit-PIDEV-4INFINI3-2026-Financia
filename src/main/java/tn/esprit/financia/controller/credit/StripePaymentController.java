package tn.esprit.financia.controller.credit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.credit.StripeCheckoutSessionDto;
import tn.esprit.financia.service.credit.RemboursementService;
import tn.esprit.financia.service.credit.StripePaymentService;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/stripe")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StripePaymentController {

    private static final Logger log = LoggerFactory.getLogger(StripePaymentController.class);

    private final StripePaymentService stripePaymentService;
    private final RemboursementService remboursementService;
    private final ObjectMapper objectMapper;

    @GetMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhookReachable() {
        return ResponseEntity.ok(Map.of(
                "ok", true,
                "message", "Webhook endpoint is reachable. Stripe will call this URL with POST requests."
        ));
    }

    /**
     * Crée une session Stripe Checkout pour payer une échéance (remboursement).
     */
    @PostMapping("/checkout/remboursements/{remboursementId}")
    public ResponseEntity<StripeCheckoutSessionDto> createCheckout(@PathVariable Long remboursementId) {
        return ResponseEntity.ok(stripePaymentService.createCheckoutSessionForRemboursement(remboursementId));
    }

    /**
     * Fallback de confirmation (dev): le front appelle ce endpoint après la redirection Stripe
     * avec ?session_id=... pour marquer PAID même si le webhook n’est pas joignable.
     */
    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirm(@RequestParam("session_id") String sessionId) {
        Long remboursementId = stripePaymentService.confirmPaidCheckoutSession(sessionId);
        if (remboursementId != null) {
            try {
                remboursementService.pay(remboursementId, LocalDateTime.now());
            } catch (IllegalStateException ex) {
                log.warn("Stripe confirm could not mark PAID: remboursementId={} reason={}", remboursementId, ex.getMessage());
            }
        }
        return ResponseEntity.ok(Map.of(
                "ok", true,
                "remboursementId", remboursementId
        ));
    }

    /**
     * Webhook Stripe: appelé par Stripe pour confirmer le paiement.
     * Configure l'URL dans le dashboard Stripe (ex: https://<ngrok>/api/payments/stripe/webhook).
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhook(
            @RequestBody String payload,
            HttpServletRequest request
    ) {
        String sigHeader = request.getHeader("Stripe-Signature");
        if (sigHeader == null || sigHeader.isBlank()) {
            log.warn("Stripe webhook called without Stripe-Signature header (likely manual call).");
        }
        Event event = stripePaymentService.constructEvent(payload, sigHeader);
        log.info("Stripe webhook received: type={} id={}", event.getType(), event.getId());

        // On valide uniquement les paiements Checkout
        if ("checkout.session.completed".equals(event.getType())) {
            String remboursementIdStr = extractRemboursementId(event, payload);
            log.info("Stripe checkout.session.completed remboursementId={}", remboursementIdStr);
            if (remboursementIdStr != null && !remboursementIdStr.isBlank()) {
                Long remboursementId = Long.valueOf(remboursementIdStr);
                try {
                    remboursementService.pay(remboursementId, LocalDateTime.now());
                    log.info("Remboursement paid from Stripe webhook: remboursementId={}", remboursementId);
                } catch (IllegalStateException ex) {
                    // Important: on loggue la cause (sinon DB reste inchangée sans explication)
                    log.warn("Stripe webhook could not mark PAID: remboursementId={} reason={}", remboursementId, ex.getMessage());
                }
            }
        }

        return ResponseEntity.ok(Map.of("received", true));
    }

    private String extractRemboursementId(Event event, String payload) {
        // 1) Essayer via Stripe SDK deserializer
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (session != null && session.getMetadata() != null) {
            String id = session.getMetadata().get("remboursementId");
            if (id != null && !id.isBlank()) return id;
        }

        // 2) Fallback: parser JSON brut (cas où Stripe Java n'arrive pas à désérialiser l'objet)
        try {
            JsonNode root = objectMapper.readTree(payload);
            JsonNode metadata = root.path("data").path("object").path("metadata");
            JsonNode idNode = metadata.get("remboursementId");
            if (idNode != null && !idNode.isNull()) {
                return idNode.asText();
            }
        } catch (IOException ignored) {
        }
        return null;
    }
}

