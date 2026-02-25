package tn.esprit.financia.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.dto.AuthResponse;
import tn.esprit.financia.dto.LoginRequest;
import tn.esprit.financia.dto.RegisterRequest;
import tn.esprit.financia.entities.PasswordResetToken;
import tn.esprit.financia.entities.Role;
import tn.esprit.financia.entities.User;
import tn.esprit.financia.repository.PasswordResetTokenRepository;
import tn.esprit.financia.security.JwtService;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int RESET_TOKEN_EXPIRY_HOURS = 1;

    private final IUserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final FaceRecognitionService faceRecognitionService;

    public AuthService(IUserService userService, PasswordEncoder passwordEncoder, JwtService jwtService,
                       EmailService emailService, PasswordResetTokenRepository resetTokenRepository,
                       FaceRecognitionService faceRecognitionService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.resetTokenRepository = resetTokenRepository;
        this.faceRecognitionService = faceRecognitionService;
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        if (email == null) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        User user = userService.getUserByEmail(email);
        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        if (user.getRole() == null) {
            throw new IllegalArgumentException("User has no role assigned");
        }
        String token = jwtService.generateToken(user.getEmail(), user.getIdUser(), user.getRole().name());
        return new AuthResponse(token, user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (email == null) {
            throw new IllegalArgumentException("Email is required");
        }
        if (userService.getUserByEmail(email) != null) {
            throw new IllegalArgumentException("This email is already used");
        }
        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(email);
        user.setPassword(request.password());
        user.setPhone(request.phone());
        user.setAddress(request.address());
        user.setRole(request.role() != null ? request.role() : Role.CLIENT);

        if (request.facePhotoBase64() != null && !request.facePhotoBase64().isBlank()) {
            try {
                user.setFacePhoto(decodeBase64Image(request.facePhotoBase64()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Photo de visage invalide : " + e.getMessage());
            }
        }

        try {
            User saved = userService.addUser(user);
            String token = jwtService.generateToken(saved.getEmail(), saved.getIdUser(), saved.getRole().name());
            return new AuthResponse(token, saved);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("This email is already used");
        }
    }

    /**
     * Enregistre la photo de visage de l'utilisateur connecté (enrollment).
     */
    @Transactional
    public void faceEnroll(Long userId, String imageBase64) {
        if (imageBase64 == null || imageBase64.isBlank()) {
            throw new IllegalArgumentException("Image base64 requise");
        }
        byte[] imageBytes = decodeBase64Image(imageBase64);
        userService.updateFacePhoto(userId, imageBytes);
    }

    /**
     * Connexion par reconnaissance faciale (1:1 avec la photo de référence).
     */
    public AuthResponse faceLogin(String email, String imageBase64) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null) {
            throw new IllegalArgumentException("Email requis");
        }
        User user = userService.getUserByEmail(normalizedEmail);
        if (user == null) {
            throw new IllegalArgumentException("Aucun compte trouvé pour cet email");
        }
        if (user.getFacePhoto() == null) {
            throw new IllegalArgumentException("Aucune photo enregistrée pour ce compte. Effectuez d'abord l'enrollment.");
        }
        if (imageBase64 == null || imageBase64.isBlank()) {
            throw new IllegalArgumentException("Image base64 requise");
        }

        FaceRecognitionService.FaceCompareResult result = faceRecognitionService.compare(user.getFacePhoto(), imageBase64);

        if (result.hasError()) {
            throw new IllegalArgumentException(result.errorMessage());
        }
        if (!result.match()) {
            throw new IllegalArgumentException(
                String.format("Visage non reconnu (similarité : %.1f%%)", result.similarity())
            );
        }

        String token = jwtService.generateToken(user.getEmail(), user.getIdUser(), user.getRole().name());
        return new AuthResponse(token, user);
    }

    private byte[] decodeBase64Image(String imageBase64) {
        try {
            String b64 = imageBase64.contains(",") ? imageBase64.split(",", 2)[1] : imageBase64;
            return java.util.Base64.getDecoder().decode(b64);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Format base64 invalide");
        }
    }

    private String normalizeEmail(String email) {
        return (email != null && !email.isBlank()) ? email.trim().toLowerCase() : null;
    }

    @Transactional
    public ForgotPasswordResult forgotPassword(String email) {
        String normalizedEmail = normalizeEmail(email);
        User user = normalizedEmail != null ? userService.getUserByEmail(normalizedEmail) : null;
        // Ne pas révéler si l'email existe ou non (sécurité)
        if (user == null) {
            log.info("Forgot-password: email {} non trouvé en base, aucun email envoyé", email);
            return new ForgotPasswordResult(false, null);
        }

        // Supprimer les anciens tokens de cet utilisateur
        List<PasswordResetToken> oldTokens = resetTokenRepository.findByUser(user);
        resetTokenRepository.deleteAll(oldTokens);

        // Générer un nouveau token sécurisé
        String token = generateSecureToken();
        Instant expiry = Instant.now().plusSeconds(RESET_TOKEN_EXPIRY_HOURS * 3600L);
        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiry);
        resetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), token, user.getFirstName());

        return new ForgotPasswordResult(true, token);
    }

    public record ForgotPasswordResult(boolean sent, String resetToken) {}

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = resetTokenRepository.findByTokenWithUser(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (resetToken.isExpired()) {
            resetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Reset token has expired");
        }

        Long userId = resetToken.getUser().getIdUser();
        userService.updatePassword(userId, newPassword);
        resetTokenRepository.delete(resetToken);
    }

    private String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
