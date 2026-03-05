package tn.esprit.financia.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Fond implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idFond;

    private String name;
    private String description;
    private double amount;
    private double committedAmount;

    @Enumerated(EnumType.STRING)
    private FundStatus status;

    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        if (status == null) {
            status = FundStatus.AVAILABLE;
        }
    }

    public enum FundStatus {
        AVAILABLE, FULLY_ALLOCATED, CLOSED
    }
}