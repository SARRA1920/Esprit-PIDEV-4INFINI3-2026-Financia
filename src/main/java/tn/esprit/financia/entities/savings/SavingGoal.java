package tn.esprit.financia.entities.savings;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class SavingGoal implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Positive
    private Double targetAmount;

    @PositiveOrZero
    private Double currentAmount = 0.0;

    @NotNull
    private LocalDate deadline;

    private String description;

    @Enumerated(EnumType.STRING)
    @NotNull
    private GoalStatus status = GoalStatus.IN_PROGRESS;

    private Double completionRate = 0.0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "savings_account_id", unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "transactions", "goal", "user"})
    private SavingAccount savingsAccount;

}

