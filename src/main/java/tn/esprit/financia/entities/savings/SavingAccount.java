package tn.esprit.financia.entities.savings;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import tn.esprit.financia.entities.user.User;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class SavingAccount implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @NotNull
    private AccountType type = AccountType.CLASSIC;

    @PositiveOrZero
    private Double balance = 0.0;

    @Enumerated(EnumType.STRING)
    @NotNull
    private AccountStatus status = AccountStatus.ACTIVE;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "savingsAccount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SavingTransaction> transactions;

    @OneToOne(mappedBy = "savingsAccount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private SavingGoal goal;

    // NEW: Many-to-One relationship to User (one user owns multiple accounts)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)  // Foreign key column
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "credits", "facePhoto", "password"})
    private User user;  // Links to the owner

    @PreUpdate
    void setUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }
}