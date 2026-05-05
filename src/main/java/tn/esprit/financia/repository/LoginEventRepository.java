package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.financia.entities.LoginEvent;
import tn.esprit.financia.entities.User;

import java.time.Instant;
import java.util.List;

public interface LoginEventRepository extends JpaRepository<LoginEvent, Long> {
    long countByUserAndSuccessIsFalseAndCreatedAtAfter(User user, Instant createdAt);

    boolean existsByUserAndSuccessIsTrueAndCountryIgnoreCaseNot(User user, String country);

    @Query(value = """
            SELECT DATE(le.created_at) AS period,
                   AVG(le.risk_score) AS avgRisk,
                   COUNT(*) AS totalEvents
            FROM login_events le
            WHERE le.created_at >= :from AND le.created_at < :to
            GROUP BY DATE(le.created_at)
            ORDER BY DATE(le.created_at)
            """, nativeQuery = true)
    List<RiskTrendProjection> findDailyRiskTrend(@Param("from") Instant from, @Param("to") Instant to);

    @Modifying
    @Query("DELETE FROM LoginEvent le WHERE le.user.idUser = :userId")
    int deleteAllByUserId(@Param("userId") Long userId);
}
