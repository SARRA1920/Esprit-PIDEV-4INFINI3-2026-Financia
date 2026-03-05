package tn.esprit.financia.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import tn.esprit.financia.entities.enums.CommitmentStatus;
import tn.esprit.financia.exception.ImmutabilityViolationException;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "commitment_history")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CommitmentHistory implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "partenaire_fond_id", nullable = false)
    private PartenaireFond partenaireFond;

    @Enumerated(EnumType.STRING)
    private CommitmentStatus previousStatus;

    @Enumerated(EnumType.STRING)
    private CommitmentStatus newStatus;

    @Enumerated(EnumType.STRING)
    private HistoryEventType eventType;

    private Double paymentAmount;
    private LocalDate eventDate;
    private String reason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        recordedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        throw new ImmutabilityViolationException("Historical records are immutable and cannot be modified");
    }

    @PreRemove
    protected void onRemove() {
        throw new ImmutabilityViolationException("Historical records cannot be deleted");
    }

    // Setters for entity creation (protected by @PreUpdate for modifications)
    public void setId(Long id) {
        this.id = id;
    }

    public void setPartenaireFond(PartenaireFond partenaireFond) {
        this.partenaireFond = partenaireFond;
    }

    public void setPreviousStatus(CommitmentStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public void setNewStatus(CommitmentStatus newStatus) {
        this.newStatus = newStatus;
    }

    public void setEventType(HistoryEventType eventType) {
        this.eventType = eventType;
    }

    public void setPaymentAmount(Double paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public enum HistoryEventType {
        PAYMENT_PROCESSED, STATUS_CHANGED, COMMITMENT_DEFAULTED
    }
}
