package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.financia.entities.SecurityAlert;
import tn.esprit.financia.entities.User;

import java.time.Instant;
import java.util.List;

public interface SecurityAlertRepository extends JpaRepository<SecurityAlert, Long> {
    List<SecurityAlert> findByUser_IdUserOrderByCreatedAtDesc(Long userId);

    boolean existsByUserAndTypeAndCreatedAtAfter(User user, String type, Instant createdAt);
}
