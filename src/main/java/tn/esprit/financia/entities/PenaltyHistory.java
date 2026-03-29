package tn.esprit.financia.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
public class PenaltyHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "echeancier_payement_id", nullable = false)
    private EcheancierPayement echeancier;

    @Column(nullable = false)
    private LocalDate calculationDate;

    @Column(nullable = false)
    private Integer daysOverdue;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal penaltyAmount;

    @Column(precision = 12, scale = 3)
    private BigDecimal previousPenaltyAmount;

    @Column(nullable = false)
    private String calculationMethod;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
    }
}
