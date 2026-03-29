package tn.esprit.financia.entities;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.financia.entities.enums.CommitmentStatus;
import tn.esprit.financia.entities.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.Instant;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
public class PartnerFund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "partner_id", nullable = false)
    private Partner partner;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fund_id", nullable = false)
    private Fund fund;

    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal committedAmount;

    @Column(precision = 15, scale = 3)
    private BigDecimal paidAmount;

    private String contractRef;

    @Enumerated(EnumType.STRING)
    private PaymentMode paymentMode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommitmentStatus status;

    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
        if (this.paidAmount == null) {
            this.paidAmount = BigDecimal.ZERO;
        }
        if (this.status == null) {
            this.status = CommitmentStatus.PENDING;
        }
    }
}