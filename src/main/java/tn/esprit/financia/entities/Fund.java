package tn.esprit.financia.entities;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.financia.entities.enums.FundStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
public class Fund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(nullable = false)
    private String currency;

    private String targetGroup;
    private LocalDate startDate;
    private LocalDate endDate;

    @Column(precision = 12, scale = 3)
    private BigDecimal minLoanAmount;

    @Column(precision = 12, scale = 3)
    private BigDecimal maxLoanAmount;

    private Integer maxDurationMonths;
    private String interestRatePolicy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FundStatus status;

    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) {
            this.status = FundStatus.DRAFT;
        }
    }
}