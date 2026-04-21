package tn.esprit.financia.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.financia.entities.user.SecurityAlert;
import tn.esprit.financia.entities.user.User;

import java.time.Instant;
import java.util.List;

public interface SecurityAlertRepository extends JpaRepository<SecurityAlert, Long> {
    List<SecurityAlert> findByUser_IdUserOrderByCreatedAtDesc(Long userId);

    boolean existsByUserAndTypeAndCreatedAtAfter(User user, String type, Instant createdAt);
}
