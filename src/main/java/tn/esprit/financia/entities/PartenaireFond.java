package tn.esprit.financia.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tn.esprit.financia.entities.enums.CommitmentStatus;
import tn.esprit.financia.entities.enums.PaymentMode;

import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PartenaireFond implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_partenaire")
    private Partenaire partenaire;

    @ManyToOne
    @JoinColumn(name = "id_fond")
    private Fond fond;

    private double committedAmount;

    @Enumerated(EnumType.STRING)
    private CommitmentStatus commitmentStatus;

    @Enumerated(EnumType.STRING)
    private PaymentMode paymentMode;

    private LocalDate commitmentDate;
    private LocalDate paymentDate;
    private Double paymentAmount;  // Changed to Double to allow null
    private LocalDate defaultDate;

    @PrePersist
    protected void onCommit() {
        commitmentDate = LocalDate.now();
        if (commitmentStatus == null) {
            commitmentStatus = CommitmentStatus.PENDING;
        }
    }
}