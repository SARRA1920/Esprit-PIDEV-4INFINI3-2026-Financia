package tn.esprit.financia.entities.credit;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import tn.esprit.financia.entities.user.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Credit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference("user-credits")
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal amount;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "paid_amount", precision = 12, scale = 3)
    private BigDecimal paidAmount;

    @Column(name = "remaining_amount", precision = 12, scale = 3)
    private BigDecimal remainingAmount;

    @Column(nullable = false)
    private Integer durationMonths;

    private LocalDate startDate;
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusC status;

    @Column(precision = 5, scale = 2)
    private BigDecimal riskScore;

    private Instant createdAt;
    private Instant updatedAt;

    @JsonManagedReference("credit-remboursements")
    @OneToMany(mappedBy = "credit", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Remboursement> remboursements = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) this.status = StatusC.PENDING;
        if (this.paidAmount == null) this.paidAmount = BigDecimal.ZERO;
        if (this.remainingAmount == null && this.amount != null) this.remainingAmount = this.amount;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}

