package tn.esprit.financia.controller.user;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.user.AuthLoginRequest;

import java.util.Locale;
import java.util.Map;

import tn.esprit.financia.dto.user.AuthRegisterRequest;
import tn.esprit.financia.dto.user.AuthResponse;
import tn.esprit.financia.dto.user.FaceEnrollRequest;
import tn.esprit.financia.dto.user.FaceVerifyRequest;
import tn.esprit.financia.dto.user.ForgotPasswordRequest;
import tn.esprit.financia.dto.user.GoogleLoginRequest;
import tn.esprit.financia.dto.user.GoogleProfileResponse;
import tn.esprit.financia.dto.user.GoogleRegisterRequest;
import tn.esprit.financia.dto.user.RegisterRequest;
import tn.esprit.financia.dto.user.ResetPasswordRequest;
import tn.esprit.financia.dto.user.UserResponse;
import tn.esprit.financia.entities.user.User;
import tn.esprit.financia.repository.user.UserRepository;
import tn.esprit.financia.service.user.AuthService;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody AuthRegisterRequest req) {
        AuthResponse ar = authService.register(new RegisterRequest(
                req.firstName(),
                req.lastName(),
                req.email(),
                req.password(),
                req.phone(),
                req.address(),
                req.role(),
                req.monthlyIncome(),
                req.facePhotoBase64()
        ));
        User saved = ar.user();
        return ResponseEntity.ok(toResponse(saved));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthLoginRequest req) {
        if (req == null || req.email() == null || req.password() == null) {
            return ResponseEntity.badRequest().body("Email and password are required.");
        }

        String email = req.email().trim().toLowerCase(Locale.ROOT);
        String supplied = req.password().strip();
        return userRepository.findByEmailIgnoreCase(email)
                .map(user -> {
                    String stored = user.getPassword();
                    if (stored != null) {
                        stored = stored.strip();
                    }
                    // Uniquement BCrypt.matches : ne jamais accepter stored.equals(supplied), sinon coller n’importe
                    // quel digest/hash copié depuis la BDD (BCrypt, MD5 hex, etc.) permettait de se connecter.
                    boolean ok = stored != null && passwordEncoder.matches(supplied, stored);

                    if (!ok) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
                    return ResponseEntity.ok(toResponse(user));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials."));
    }

    /** Connexion avec Google : compte déjà existant uniquement. */
    @PostMapping("/google")
    public ResponseEntity<UserResponse> loginWithGoogle(@RequestBody GoogleLoginRequest req) {
        AuthResponse ar = authService.googleLogin(req.idToken());
        return ResponseEntity.ok(toResponse(ar.user()));
    }

    /** Étape 1 inscription Google : valide le jeton et renvoie prénom / nom / e-mail (sans créer de ligne). */
    @PostMapping("/google-profile")
    public ResponseEntity<GoogleProfileResponse> googleProfile(@RequestBody GoogleLoginRequest req) {
        return ResponseEntity.ok(authService.googleProfile(req.idToken()));
    }

    /** Étape 2 inscription Google : crée le compte avec champs formulaire + identité issue du jeton. */
    @PostMapping("/register-google")
    public ResponseEntity<UserResponse> registerWithGoogle(@RequestBody GoogleRegisterRequest req) {
        AuthResponse ar = authService.registerWithGoogle(req);
        return ResponseEntity.ok(toResponse(ar.user()));
    }

    /** Connexion par reconnaissance faciale (photo live vs photo enregistrée ; service Python DeepFace). */
    @PostMapping("/face-login")
    public ResponseEntity<UserResponse> loginWithFace(@RequestBody FaceVerifyRequest req) {
        AuthResponse ar = authService.faceLogin(req.email(), req.imageBase64());
        return ResponseEntity.ok(toResponse(ar.user()));
    }

    /** Enrôlement du visage (après inscription), si non fourni lors de /register. */
    @PostMapping("/face-enroll/{userId}")
    public ResponseEntity<String> faceEnroll(@PathVariable Long userId, @RequestBody FaceEnrollRequest req) {
        authService.faceEnroll(userId, req.imageBase64());
        return ResponseEntity.ok("Face enrollment saved successfully.");
    }

    /**
     * Demande de lien de réinitialisation (e-mail). Réponse identique que l’e-mail existe ou non.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req != null ? req.email() : null);
        return ResponseEntity.ok(Map.of(
                "message",
                "Si un compte est associé à cet e-mail, vous recevrez sous peu un lien pour réinitialiser votre mot de passe."
        ));
    }

    /** Définit un nouveau mot de passe à partir du jeton reçu par e-mail. */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPasswordApi(@RequestBody ResetPasswordRequest req) {
        if (req == null || req.token() == null || req.token().isBlank()) {
            throw new IllegalArgumentException("Jeton de réinitialisation manquant ou invalide.");
        }
        authService.resetPassword(req.token().trim(), req.newPassword());
        return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour. Vous pouvez vous connecter."));
    }

    private static UserResponse toResponse(User u) {
        return new UserResponse(
                u.getIdUser(),
                u.getFirstName(),
                u.getLastName(),
                u.getEmail(),
                u.getPhone(),
                u.getAddress(),
                u.getRole(),
                u.getMonthlyIncome(),
                u.getYearsAsClient(),
                u.getProjectGoal()
        );
    }
}

