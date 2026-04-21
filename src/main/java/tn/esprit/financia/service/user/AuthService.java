package tn.esprit.financia.service.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import tn.esprit.financia.dto.user.AuthResponse;
import tn.esprit.financia.dto.user.LoginRequest;
import tn.esprit.financia.dto.user.RegisterRequest;
import tn.esprit.financia.dto.user.SecurityAlertResponse;
import tn.esprit.financia.entities.user.LoginEvent;
import tn.esprit.financia.entities.user.PasswordResetToken;
import tn.esprit.financia.entities.user.Role;
import tn.esprit.financia.entities.user.SecurityAlert;
import tn.esprit.financia.entities.user.User;
import tn.esprit.financia.repository.user.LoginEventRepository;
import tn.esprit.financia.repository.user.PasswordResetTokenRepository;
import tn.esprit.financia.repository.user.SecurityAlertRepository;
import tn.esprit.financia.security.JwtService;

import java.net.URI;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int RESET_TOKEN_EXPIRY_HOURS = 1;
    private static final int FAILED_ATTEMPTS_THRESHOLD = 5;
    private static final int FAILED_ATTEMPTS_WINDOW_MINUTES = 15;
    private static final String ALERT_TYPE_TOO_MANY_FAILED_LOGINS = "TOO_MANY_FAILED_LOGINS";
    private static final String ALERT_TYPE_NEW_COUNTRY_LOGIN = "NEW_COUNTRY_LOGIN";

    private final IUserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final FaceRecognitionService faceRecognitionService;
    private final LoginEventRepository loginEventRepository;
    private final SecurityAlertRepository securityAlertRepository;
    private final String googleClientId;
    private final RestTemplate restTemplate;

    public AuthService(IUserService userService, PasswordEncoder passwordEncoder, JwtService jwtService,
                       EmailService emailService, PasswordResetTokenRepository resetTokenRepository,
                       FaceRecognitionService faceRecognitionService,
                       LoginEventRepository loginEventRepository,
                       SecurityAlertRepository securityAlertRepository,
                       @Value("${google.oauth.client-id:}") String googleClientId) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.resetTokenRepository = resetTokenRepository;
        this.faceRecognitionService = faceRecognitionService;
        this.loginEventRepository = loginEventRepository;
        this.securityAlertRepository = securityAlertRepository;
        this.googleClientId = googleClientId;
        this.restTemplate = new RestTemplate();
    }

    public AuthResponse login(LoginRequest request) {
        return login(request, null, request.country());
    }

    public AuthResponse login(LoginRequest request, String clientIp, String requestCountry) {
        String email = normalizeEmail(request.email());
        if (email == null) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        User user = userService.getUserByEmail(email);
        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            recordLoginEvent(user, email, false, clientIp, requestCountry);
            if (user != null) {
                evaluateFailedLoginAlert(user);
            }
            throw new IllegalArgumentException("Invalid email or password");
        }
        if (user.getRole() == null) {
            throw new IllegalArgumentException("User has no role assigned");
        }
        recordLoginEvent(user, email, true, clientIp, requestCountry);
        evaluateNewCountryAlert(user, requestCountry, clientIp);
        String token = jwtService.generateToken(user.getEmail(), user.getIdUser(), user.getRole().name());
        return new AuthResponse(token, user);
    }

    @Transactional
    public AuthResponse googleLogin(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Google idToken is required");
        }
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new IllegalArgumentException("Google OAuth client id is not configured");
        }

        Map<String, Object> tokenInfo = fetchGoogleTokenInfo(idToken.trim());
        validateGoogleTokenInfo(tokenInfo);

        String email = normalizeEmail((String) tokenInfo.get("email"));
        if (email == null) {
            throw new IllegalArgumentException("Google account email is missing");
        }

        User user = userService.getUserByEmail(email);
        if (user == null) {
            user = createUserFromGoogle(email, tokenInfo);
        }

        if (user.getRole() == null) {
            user.setRole(Role.CLIENT);
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

    private Map<String, Object> fetchGoogleTokenInfo(String idToken) {
        try {
            // Encoder correctement le JWT : les caractères « = » (padding) et « + » cassent l’URL en query string brut.
            URI uri = UriComponentsBuilder.fromUriString("https://oauth2.googleapis.com/tokeninfo")
                    .queryParam("id_token", idToken)
                    .build()
                    .toUri();
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new IllegalArgumentException("Unable to validate Google token");
            }
            return response.getBody();
        } catch (RestClientException e) {
            log.warn("Google tokeninfo failed: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid Google token: " + e.getMessage());
        }
    }

    private void validateGoogleTokenInfo(Map<String, Object> tokenInfo) {
        String aud = tokenInfo.get("aud") != null ? String.valueOf(tokenInfo.get("aud")).trim() : "";
        String expected = googleClientId != null ? googleClientId.trim() : "";
        if (expected.isEmpty() || !expected.equals(aud)) {
            log.warn("Google token aud mismatch: configured='{}', token aud='{}'", expected, aud);
            throw new IllegalArgumentException("Google token audience is invalid (vérifiez google.oauth.client-id identique au front).");
        }

        if (!isGoogleEmailVerified(tokenInfo.get("email_verified"))) {
            throw new IllegalArgumentException("Google email is not verified");
        }
    }

    /** L’API tokeninfo renvoie parfois un booléen JSON, parfois la chaîne « true ». */
    private static boolean isGoogleEmailVerified(Object raw) {
        if (raw == null) {
            return false;
        }
        if (raw instanceof Boolean b) {
            return b;
        }
        return "true".equalsIgnoreCase(String.valueOf(raw).trim());
    }

    private User createUserFromGoogle(String email, Map<String, Object> tokenInfo) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(defaultIfBlank((String) tokenInfo.get("given_name"), "Google"));
        user.setLastName(defaultIfBlank((String) tokenInfo.get("family_name"), "User"));
        // Valeur unique par compte (évite un doublon si la colonne phone est unique en base).
        String phoneVal = "g-" + email.replace('@', '-');
        user.setPhone(phoneVal.length() > 50 ? phoneVal.substring(0, 50) : phoneVal);
        user.setAddress("Google Account");
        user.setRole(Role.CLIENT);
        user.setPassword(generateSecureToken());

        try {
            return userService.addUser(user);
        } catch (DataIntegrityViolationException e) {
            // Si l'utilisateur a été créé en parallèle juste avant ce save
            User existing = userService.getUserByEmail(email);
            if (existing != null) {
                return existing;
            }
            throw new IllegalArgumentException("Unable to create account from Google profile");
        }
    }

    private String defaultIfBlank(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value.trim();
    }

    public List<SecurityAlertResponse> getSecurityAlerts(Long userId) {
        return securityAlertRepository.findByUser_IdUserOrderByCreatedAtDesc(userId).stream()
                .map(alert -> new SecurityAlertResponse(
                        alert.getId(),
                        alert.getType(),
                        alert.getSeverity(),
                        alert.getMessage(),
                        alert.getMetadata(),
                        alert.isRead(),
                        alert.getCreatedAt()
                ))
                .toList();
    }

    private void recordLoginEvent(User user, String email, boolean success, String clientIp, String requestCountry) {
        LoginEvent event = new LoginEvent();
        event.setUser(user);
        event.setEmail(email);
        event.setSuccess(success);
        event.setIpAddress(normalizeIp(clientIp));
        event.setCountry(normalizeCountry(requestCountry));
        loginEventRepository.save(event);
    }

    private void evaluateFailedLoginAlert(User user) {
        Instant after = Instant.now().minusSeconds(FAILED_ATTEMPTS_WINDOW_MINUTES * 60L);
        long failedAttempts = loginEventRepository.countByUserAndSuccessIsFalseAndCreatedAtAfter(user, after);
        if (failedAttempts < FAILED_ATTEMPTS_THRESHOLD) {
            return;
        }

        boolean recentAlertExists = securityAlertRepository.existsByUserAndTypeAndCreatedAtAfter(
                user,
                ALERT_TYPE_TOO_MANY_FAILED_LOGINS,
                after
        );
        if (recentAlertExists) {
            return;
        }

        createAndNotifyAlert(
                user,
                ALERT_TYPE_TOO_MANY_FAILED_LOGINS,
                "HIGH",
                "Trop de tentatives de connexion échouées détectées.",
                "failedAttempts=" + failedAttempts + ",windowMinutes=" + FAILED_ATTEMPTS_WINDOW_MINUTES
        );
    }

    private void evaluateNewCountryAlert(User user, String requestCountry, String clientIp) {
        String normalizedCountry = normalizeCountry(requestCountry);
        if (normalizedCountry == null) {
            return;
        }

        boolean seenDifferentCountry = loginEventRepository.existsByUserAndSuccessIsTrueAndCountryIgnoreCaseNot(
                user,
                normalizedCountry
        );
        if (!seenDifferentCountry) {
            return;
        }

        Instant last24h = Instant.now().minusSeconds(24 * 3600L);
        boolean recentAlertExists = securityAlertRepository.existsByUserAndTypeAndCreatedAtAfter(
                user,
                ALERT_TYPE_NEW_COUNTRY_LOGIN,
                last24h
        );
        if (recentAlertExists) {
            return;
        }

        createAndNotifyAlert(
                user,
                ALERT_TYPE_NEW_COUNTRY_LOGIN,
                "MEDIUM",
                "Connexion détectée depuis un nouveau pays: " + normalizedCountry + ".",
                "country=" + normalizedCountry + ",ip=" + normalizeIp(clientIp)
        );
    }

    private void createAndNotifyAlert(User user, String type, String severity, String message, String metadata) {
        SecurityAlert alert = new SecurityAlert();
        alert.setUser(user);
        alert.setType(type);
        alert.setSeverity(severity);
        alert.setMessage(message);
        alert.setMetadata(metadata);
        securityAlertRepository.save(alert);
        emailService.sendSecurityAlertEmail(user.getEmail(), user.getFirstName(), message);
    }

    private String normalizeCountry(String country) {
        return (country != null && !country.isBlank()) ? country.trim().toUpperCase() : null;
    }

    private String normalizeIp(String clientIp) {
        return (clientIp != null && !clientIp.isBlank()) ? clientIp.trim() : null;
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
