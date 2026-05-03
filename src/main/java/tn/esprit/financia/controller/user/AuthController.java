package tn.esprit.financia.controller.user;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.dto.user.AuthLoginRequest;

import java.util.Locale;
import tn.esprit.financia.dto.user.AuthRegisterRequest;
import tn.esprit.financia.dto.user.AuthResponse;
import tn.esprit.financia.dto.user.FaceVerifyRequest;
import tn.esprit.financia.dto.user.GoogleLoginRequest;
import tn.esprit.financia.dto.user.UserResponse;
import tn.esprit.financia.entities.user.User;
import tn.esprit.financia.repository.user.UserRepository;
import tn.esprit.financia.security.JwtService;
import tn.esprit.financia.service.user.AuthService;
import tn.esprit.financia.service.user.IUserService;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final IUserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRegisterRequest req) {
        User user = new User();
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setEmail(req.email() == null ? null : req.email().trim().toLowerCase(Locale.ROOT));
        user.setPassword(req.password());
        user.setPhone(req.phone());
        user.setAddress(req.address());
        user.setRole(req.role());
        user.setMonthlyIncome(req.monthlyIncome());

        User saved = userService.addUser(user);
        return ResponseEntity.ok(toAuthResponse(saved));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthLoginRequest req) {
        if (req == null || req.email() == null || req.password() == null) {
            return ResponseEntity.badRequest().body("Email and password are required.");
        }

        String email = req.email().trim().toLowerCase(Locale.ROOT);
        return userRepository.findByEmailIgnoreCase(email)
                .map(user -> {
                    String stored = user.getPassword();
                    boolean ok = stored != null && passwordEncoder.matches(req.password(), stored);

                    // Backward-compat: some existing rows may have a plaintext password from older imports/tests.
                    // If it matches, upgrade it to BCrypt on first successful login.
                    if (!ok && stored != null && stored.equals(req.password())) {
                        user.setPassword(passwordEncoder.encode(req.password()));
                        userRepository.save(user);
                        ok = true;
                    }

                    if (!ok) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
                    return ResponseEntity.ok(toAuthResponse(user));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials."));
    }

    /** Connexion avec Google (id_token JWT côté client, validé via tokeninfo Google). */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@RequestBody GoogleLoginRequest req) {
        AuthResponse ar = authService.googleLogin(req.idToken());
        return ResponseEntity.ok(ar);
    }

    /** Connexion par reconnaissance faciale (photo live vs photo enregistrée ; service Python DeepFace). */
    @PostMapping("/face-login")
    public ResponseEntity<AuthResponse> loginWithFace(@RequestBody FaceVerifyRequest req) {
        AuthResponse ar = authService.faceLogin(req.email(), req.imageBase64());
        return ResponseEntity.ok(ar);
    }

    private AuthResponse toAuthResponse(User u) {
        String role = u.getRole() != null ? u.getRole().name() : "CLIENT";
        String token = jwtService.generateToken(u.getEmail(), u.getIdUser(), role);
        return new AuthResponse(token, u);
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
                u.getYearsAsClient()
        );
    }
}

