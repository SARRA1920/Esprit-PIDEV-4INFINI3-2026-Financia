package tn.esprit.financia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.EcheancierPayement;
import tn.esprit.financia.entities.User;
import tn.esprit.financia.service.EcheancierPayementService;
import tn.esprit.financia.service.WhatsAppService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
public class WhatsAppController {

    private final WhatsAppService whatsAppService;
    private final EcheancierPayementService echeancierService;

    /**
     * Send penalty notification WhatsApp for a specific payment
     */
    @PostMapping("/send-penalty-notification/{echeancierPayementId}")
    public ResponseEntity<Map<String, String>> sendPenaltyNotification(@PathVariable Long echeancierPayementId) {
        try {
            EcheancierPayement payment = echeancierService.getById(echeancierPayementId);
            User user = payment.getContrat().getCredit().getUser();

            if (user.getPhone() == null || user.getPhone().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User does not have a phone number");
                return ResponseEntity.badRequest().body(error);
            }

            whatsAppService.sendPenaltyNotification(payment, user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "WhatsApp sent successfully to " + user.getPhone());
            response.put("paymentId", echeancierPayementId.toString());
            response.put("phone", user.getPhone());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Send custom WhatsApp
     */
    @PostMapping("/send-custom")
    public ResponseEntity<Map<String, String>> sendCustomWhatsApp(
            @RequestParam String phoneNumber,
            @RequestParam String message) {
        try {
            whatsAppService.sendWhatsApp(phoneNumber, message);

            Map<String, String> response = new HashMap<>();
            response.put("message", "WhatsApp sent successfully");
            response.put("phone", phoneNumber);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Check WhatsApp service status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("enabled", whatsAppService.isEnabled());
        status.put("service", "Twilio WhatsApp");
        return ResponseEntity.ok(status);
    }
}
