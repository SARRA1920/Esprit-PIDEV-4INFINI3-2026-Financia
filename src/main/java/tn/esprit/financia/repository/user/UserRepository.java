package tn.esprit.financia.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.financia.entities.user.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);
}

