package tn.esprit.financia.entities.savings;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class SavingTransaction implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @NotNull
    private TransactionType type;

    @Positive
    private Double amount;

    private LocalDateTime transactionDate = LocalDateTime.now();
    private String reference;
    private String description;

    @Enumerated(EnumType.STRING)
    @NotNull
    private TransactionStatus status = TransactionStatus.PENDING;

    private Double anomalyScore = 0.0;
    private Boolean flagged = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "savings_account_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "transactions", "goal", "user"})
    private SavingAccount savingsAccount;
}

