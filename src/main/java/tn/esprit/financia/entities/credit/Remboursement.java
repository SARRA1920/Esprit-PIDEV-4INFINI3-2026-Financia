package tn.esprit.financia.entities.credit;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import tn.esprit.financia.entities.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Remboursement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference("credit-remboursements")
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_id", nullable = false)
    private Credit credit;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal amount;

    /**
     * Date d'échéance (utile pour calculer les retards).
     */
    private LocalDate dueDate;

    @Column(name = "payment_date", nullable = true)
    private LocalDateTime paymentDate;

    /**
     * Nombre de jours de retard (>= 0).
     */
    private Integer lateDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
        normalizePaymentFields();
        recomputeLateDays();
    }

    @PreUpdate
    public void onUpdate() {
        normalizePaymentFields();
        recomputeLateDays();
    }

    /**
     * Calcul du retard:
     * - si payé: compare dueDate vs paymentDate
     * - si non payé: compare dueDate vs aujourd'hui (pour identifier un retard en cours)
     */
    public void recomputeLateDays() {
        if (this.dueDate == null) {
            this.lateDays = 0;
            return;
        }

        LocalDate ref = (this.paymentDate != null) ? this.paymentDate.toLocalDate() : LocalDate.now();
        long days = ChronoUnit.DAYS.between(this.dueDate, ref);
        this.lateDays = (int) Math.max(0, days);
    }

    @Transient
    public boolean isLate() {
        return this.lateDays != null && this.lateDays > 0;
    }

    @Transient
    public boolean isOverdue() {
        return this.status == PaymentStatus.PENDING
                && this.paymentDate == null
                && this.dueDate != null
                && LocalDate.now().isAfter(this.dueDate);
    }

    private void normalizePaymentFields() {
        // Si paymentDate est fourni, on considère que c'est un paiement effectué.
        if (this.paymentDate != null && (this.status == null || this.status == PaymentStatus.PENDING)) {
            this.status = PaymentStatus.PAID;
        }
        // Si status PAID => paymentDate doit exister
        if (this.status == PaymentStatus.PAID && this.paymentDate == null) {
            this.paymentDate = LocalDateTime.now();
        }
        // Si rien n'est fourni => PENDING
        if (this.status == null) {
            this.status = PaymentStatus.PENDING;
        }
    }

    /** Exposé JSON pour l’admin (le champ {@code credit} reste masqué par {@link JsonBackReference}). */
    @JsonProperty("creditId")
    public Long getCreditId() {
        return credit == null ? null : credit.getId();
    }

    @JsonProperty("clientName")
    public String getClientName() {
        if (credit == null) {
            return null;
        }
        User u = credit.getUser();
        if (u == null) {
            return null;
        }
        String fn = u.getFirstName() != null ? u.getFirstName() : "";
        String ln = u.getLastName() != null ? u.getLastName() : "";
        return (fn + " " + ln).trim();
    }
}

