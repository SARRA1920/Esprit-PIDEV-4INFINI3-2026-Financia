package tn.esprit.financia.service.credit;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.config.StripeProperties;
import tn.esprit.financia.dto.credit.StripeCheckoutSessionDto;
import tn.esprit.financia.entities.credit.PaymentStatus;
import tn.esprit.financia.entities.credit.Remboursement;
import tn.esprit.financia.entities.credit.StatusC;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StripePaymentService {

    private static final RoundingMode RM = RoundingMode.HALF_UP;

    private final StripeProperties stripeProperties;
    private final RemboursementService remboursementService;

    @PostConstruct
    void init() {
        if (stripeProperties.getSecretKey() != null && !stripeProperties.getSecretKey().isBlank()) {
            Stripe.apiKey = stripeProperties.getSecretKey();
        }
    }

    @Transactional(readOnly = true)
    public StripeCheckoutSessionDto createCheckoutSessionForRemboursement(Long remboursementId) {
        Remboursement r = remboursementService.getById(remboursementId);
        if (r.getStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Ce remboursement est déjà payé.");
        }
        // REJECTED : aucun paiement. PENDING / APPROVED / ACTIVE : paiement Stripe autorisé si l’échéance existe.
        if (r.getCredit() != null && r.getCredit().getStatus() == StatusC.REJECTED) {
            throw new IllegalStateException("Impossible de payer une échéance pour un crédit REJECTED.");
        }
        if (r.getAmount() == null || r.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Montant de remboursement invalide.");
        }

        long amountInMinor = toMinorUnit(r.getAmount());

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(stripeProperties.getSuccessUrl())
                    .setCancelUrl(stripeProperties.getCancelUrl())
                    .putAllMetadata(Map.of(
                            "remboursementId", String.valueOf(remboursementId),
                            "creditId", r.getCredit() != null && r.getCredit().getId() != null ? String.valueOf(r.getCredit().getId()) : ""
                    ))
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency(stripeProperties.getCurrency())
                                    .setUnitAmount(amountInMinor)
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Paiement échéance (Remboursement #" + remboursementId + ")")
                                            .build())
                                    .build())
                            .build())
                    .build();

            Session session = Session.create(params);
            return new StripeCheckoutSessionDto(session.getId(), session.getUrl());
        } catch (StripeException e) {
            throw new RuntimeException("Stripe error: " + e.getMessage(), e);
        }
    }

    /**
     * Webhook handler: valide la signature et retourne l'Event Stripe.
     */
    public Event constructEvent(String payload, String stripeSignatureHeader) {
        String secret = stripeProperties.getWebhookSecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("stripe.webhook-secret n'est pas configuré.");
        }
        try {
            return Webhook.constructEvent(payload, stripeSignatureHeader, secret);
        } catch (SignatureVerificationException e) {
            throw new IllegalArgumentException("Signature Stripe invalide.");
        }
    }

    /**
     * Convertit un montant (ex: 200.000) en centimes (minor unit) => 20000.
     * Ici on suppose une monnaie avec 2 décimales (EUR, USD...).
     */
    private static long toMinorUnit(BigDecimal amount) {
        return amount
                .setScale(2, RM)
                .multiply(BigDecimal.valueOf(100))
                .longValueExact();
    }

    /**
     * Fallback "confirm" (utile en dev quand Stripe ne peut pas appeler localhost).
     * Récupère la Session Checkout et vérifie qu'elle est payée.
     * Retourne le remboursementId s'il est trouvé dans les metadata, sinon null.
     */
    @Transactional(readOnly = true)
    public Long confirmPaidCheckoutSession(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new IllegalArgumentException("sessionId est requis.");
        }
        try {
            Session session = Session.retrieve(sessionId);
            if (session == null) {
                throw new IllegalStateException("Session Stripe introuvable.");
            }
            // Stripe renvoie typiquement payment_status = "paid" sur checkout.session.completed
            if (session.getPaymentStatus() == null || !"paid".equalsIgnoreCase(session.getPaymentStatus())) {
                throw new IllegalStateException("Paiement Stripe non confirmé (payment_status != paid).");
            }
            if (session.getMetadata() == null) return null;
            String rid = session.getMetadata().get("remboursementId");
            if (rid == null || rid.isBlank()) return null;
            return Long.valueOf(rid);
        } catch (Exception e) {
            throw new RuntimeException("Impossible de confirmer la session Stripe: " + e.getMessage(), e);
        }
    }
}

