package tn.esprit.financia.entities.savings;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "savings_audit_log", indexes = @Index(name = "idx_audit_created", columnList = "created_at"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Utilisateur concerné (propriétaire du compte / auteur de l’action). */
    @Column(nullable = false)
    private Long userId;

    /** Ex. OPEN_ACCOUNT, LARGE_WITHDRAWAL, LARGE_DEPOSIT */
    @Column(nullable = false, length = 64)
    private String action;

    private Long accountId;

    private Double amount;

    @Column(length = 600)
    private String detail;

    @Column(nullable = false)
    private Instant createdAt;
}
