package tn.esprit.financia.entities.partenaire;

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
public class Partenaire implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPartenaire;

    private String name;

    @Enumerated(EnumType.STRING)
    private PartnerType type;

    private String email;
    private String phone;
    private String address;
    private String website;

    @Enumerated(EnumType.STRING)
    private PartnerStatus status;

    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        if (status == null) {
            status = PartnerStatus.ACTIVE;
        }
    }

    public enum PartnerType {
        BANK, MICROFINANCE, GOVERNMENT_AGENCY, NGO, PRIVATE_INVESTOR
    }

    public enum PartnerStatus {
        ACTIVE, INACTIVE, PENDING_APPROVAL
    }
}