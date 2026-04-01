package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.financia.entities.LoginEvent;
import tn.esprit.financia.entities.User;

import java.time.Instant;

public interface LoginEventRepository extends JpaRepository<LoginEvent, Long> {
    long countByUserAndSuccessIsFalseAndCreatedAtAfter(User user, Instant createdAt);

    boolean existsByUserAndSuccessIsTrueAndCountryIgnoreCaseNot(User user, String country);
}
