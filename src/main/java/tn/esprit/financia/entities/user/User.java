package tn.esprit.financia.entities.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tn.esprit.financia.entities.credit.Credit;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUser;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(nullable = false)
    private String phone;

    private String address;

    /**
     * Photo de référence pour la reconnaissance faciale (bytes image).
     */
    @Lob
    @JsonIgnore
    private byte[] facePhoto;

    @Enumerated(EnumType.STRING)
    private Role role;

    /**
     * Revenu mensuel utilisé pour le scoring (DTI).
     */
    @Column(precision = 12, scale = 3)
    private BigDecimal monthlyIncome;

    /**
     * Date d'inscription ; sert à calculer l'ancienneté client (années).
     */
    @Column(name = "created_at")
    private Instant createdAt;

    @JsonManagedReference("user-credits")
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Credit> credits = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    /**
     * Ancienneté en années (non persistée) : écart entre la date d'inscription et aujourd'hui.
     * Utilisé par le scoring et sérialisé JSON sous "yearsAsClient".
     */
    public Integer getYearsAsClient() {
        return yearsSinceRegistration(createdAt);
    }

    /** {@code null} si date d'inscription inconnue (données anciennes). */
    public static Integer yearsSinceRegistration(Instant registeredAt) {
        if (registeredAt == null) {
            return null;
        }
        LocalDate start = registeredAt.atZone(ZoneId.systemDefault()).toLocalDate();
        long y = ChronoUnit.YEARS.between(start, LocalDate.now());
        return (int) Math.min(Integer.MAX_VALUE, Math.max(0L, y));
    }
}

