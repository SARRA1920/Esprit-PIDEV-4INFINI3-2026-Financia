package tn.esprit.financia.entities;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.financia.entities.enums.PartnerStatus;
import tn.esprit.financia.entities.enums.PartnerType;

import java.time.Instant;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
public class Partner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartnerType type;

    private String email;
    private String phone;
    private String address;
    private String website;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartnerStatus status;

    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) {
            this.status = PartnerStatus.ACTIVE;
        }
    }
}