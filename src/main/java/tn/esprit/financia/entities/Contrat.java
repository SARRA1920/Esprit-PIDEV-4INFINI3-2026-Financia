package tn.esprit.financia.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import tn.esprit.financia.entities.enums.PenaltyType;
import tn.esprit.financia.entities.enums.TypeContrat;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
public class Contrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_id", nullable = false, unique = true)
    private Credit credit;

    @Column(nullable = false)
    private LocalDate signedDate;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal amount;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal rate;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeContrat type;

    @Column(length = 3)
    private String currency; // "USD", "EUR", "TND"

    @Column(precision = 12, scale = 3)
    private BigDecimal originalAmount; // Amount in original currency

    @Column(precision = 12, scale = 3)
    private BigDecimal amountInTND; // Converted to TND

    @Column(precision = 10, scale = 6)
    private BigDecimal exchangeRateUsed; // Rate at time of contract

    // Penalty Configuration
    @Column(precision = 5, scale = 2)
    private BigDecimal penaltyRate; // e.g., 5.00 for 5% or 10.00 for fixed 10 TND

    @Enumerated(EnumType.STRING)
    private PenaltyType penaltyType; // PERCENTAGE, FIXED, or TIERED

    @Column
    private Integer gracePeriodDays; // Days before penalty starts (e.g., 3 days)

    private Instant createdAt;
    private Instant updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "contrat", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EcheancierPayement> echeanciers = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
