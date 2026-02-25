package tn.esprit.financia.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.financia.entities.Role;
import tn.esprit.financia.entities.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Query("""
        SELECT u FROM User u
        WHERE (:keyword IS NULL OR :keyword = '' OR
               LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:role IS NULL OR u.role = :role)
        """)
    Page<User> searchUsers(@Param("keyword") String keyword, @Param("role") Role role, Pageable pageable);
}
