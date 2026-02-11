package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.financia.entities.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
