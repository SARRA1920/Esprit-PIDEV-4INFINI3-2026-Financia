package tn.esprit.financia.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.AuthResponse;
import tn.esprit.financia.dto.FaceEnrollRequest;
import tn.esprit.financia.dto.FaceVerifyRequest;
import tn.esprit.financia.dto.ForgotPasswordRequest;
import tn.esprit.financia.dto.GoogleLoginRequest;
import tn.esprit.financia.dto.LoginRequest;
import tn.esprit.financia.dto.RegisterRequest;
import tn.esprit.financia.dto.ResetPasswordRequest;
import tn.esprit.financia.dto.SecurityAlertResponse;
import tn.esprit.financia.entities.User;
import tn.esprit.financia.security.JwtPrincipal;
import tn.esprit.financia.service.AuthService;
import tn.esprit.financia.service.IUserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Authentification", description = "Login et inscription")
public class AuthController {

    private final AuthService authService;
    private final IUserService userService;
    private final boolean devReturnToken;

    public AuthController(AuthService authService, IUserService userService,
                         @Value("${app.forgot-password.dev-return-token:true}") boolean devReturnToken) {
        this.authService = authService;
        this.userService = userService;
        this.devReturnToken = devReturnToken;
    }

    @Operation(summary = "Connexion", description = "Authentification par email et mot de passe")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            String clientIp = extractClientIp(httpRequest);
            AuthResponse response = authService.login(request, clientIp, request.country());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Connexion Google", description = "Authentification Google via id_token puis génération JWT interne")
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            AuthResponse response = authService.googleLogin(request.idToken());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Inscription", description = "Créer un nouveau compte utilisateur")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Mot de passe oublié", description = "Envoie un email avec un lien de réinitialisation. En mode dev, le token est renvoyé dans la réponse.")
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        var result = authService.forgotPassword(request.email());
        if (devReturnToken && result.resetToken() != null) {
            return ResponseEntity.ok(Map.of(
                    "message", "Token généré. Utilise-le pour reset-password (mode dev).",
                    "resetToken", result.resetToken()
            ));
        }
        return ResponseEntity.ok(Map.of("message", "Si cet email existe, un lien de réinitialisation a été envoyé"));
    }

    @Operation(summary = "Réinitialiser le mot de passe", description = "Définit un nouveau mot de passe avec le token reçu par email")
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.token(), request.newPassword());
            return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour avec succès"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Mon profil", description = "Retourne les infos du utilisateur connecté (tous rôles)")
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal JwtPrincipal principal) {
        User user = userService.getUser(principal.userId());
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Alertes de securite", description = "Retourne les alertes de securite du compte connecte")
    @GetMapping("/security-alerts")
    public ResponseEntity<List<SecurityAlertResponse>> getSecurityAlerts(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(authService.getSecurityAlerts(principal.userId()));
    }

    @Operation(summary = "Enregistrer photo de visage", description = "Sauvegarde la photo de référence de l'utilisateur connecté (nécessite JWT)")
    @PostMapping("/face/enroll")
    public ResponseEntity<?> faceEnroll(@AuthenticationPrincipal JwtPrincipal principal,
                                        @RequestBody FaceEnrollRequest request) {
        try {
            authService.faceEnroll(principal.userId(), request.imageBase64());
            return ResponseEntity.ok(Map.of("message", "Photo de visage enregistrée avec succès"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Connexion par visage", description = "Authentification par reconnaissance faciale (sans mot de passe)")
    @PostMapping("/face/verify")
    public ResponseEntity<?> faceVerify(@RequestBody FaceVerifyRequest request) {
        try {
            AuthResponse response = authService.faceLogin(request.email(), request.imageBase64());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
