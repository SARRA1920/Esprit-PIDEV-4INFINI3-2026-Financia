package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.financia.entities.PasswordResetToken;
import tn.esprit.financia.entities.User;

import java.util.List;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    @Query("SELECT t FROM PasswordResetToken t JOIN FETCH t.user WHERE t.token = :token")
    Optional<PasswordResetToken> findByTokenWithUser(@Param("token") String token);

    Optional<PasswordResetToken> findByToken(String token);

    List<PasswordResetToken> findByUser(User user);

    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.user.idUser = :userId")
    int deleteAllByUserId(@Param("userId") Long userId);
}
