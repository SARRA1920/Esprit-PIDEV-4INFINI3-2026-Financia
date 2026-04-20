package tn.fiancia.financia.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.fiancia.financia.entities.User;

import java.util.Optional;

/**
 * Repository interface for User entity.
 * Provides database access methods for user operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by username.
     *
     * @param username the username
     * @return Optional containing the user if found
     */
    Optional<User> findByUsername(String username);

    /**
     * Finds a user by email address.
     *
     * @param email the email address
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a username exists.
     *
     * @param username the username
     * @return true if username exists
     */
    boolean existsByUsername(String username);

    /**
     * Checks if an email exists.
     *
     * @param email the email
     * @return true if email exists
     */
    boolean existsByEmail(String email);
}
