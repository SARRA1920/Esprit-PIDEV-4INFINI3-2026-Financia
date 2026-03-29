package tn.esprit.financia.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import tn.esprit.financia.entities.enums.StatusE;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
public class EcheancierPayement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_id", nullable = false)
    private Contrat contrat;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal amountDue;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal principalAmount;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal interestAmount;

    @Column(precision = 12, scale = 3)
    private BigDecimal penaltyAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusE status;

    // Penalty Tracking
    @Column
    private LocalDate overdueDate; // When it became overdue

    @Column
    private Integer daysOverdue; // Calculated field

    @JsonIgnore
    @OneToMany(mappedBy = "echeancier", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PenaltyHistory> penaltyHistories = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) this.status = StatusE.PENDING;
        if (this.penaltyAmount == null) this.penaltyAmount = BigDecimal.ZERO;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
