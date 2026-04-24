package tn.esprit.financia.repository.credit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.financia.entities.credit.Credit;
import tn.esprit.financia.entities.credit.StatusC;

import java.time.Instant;
import java.util.List;

public interface CreditRepository extends JpaRepository<Credit, Long>, JpaSpecificationExecutor<Credit> {
    @Query("SELECT DISTINCT c FROM Credit c JOIN FETCH c.user")
    List<Credit> findAllWithUser();

    List<Credit> findByUser_IdUser(Long userId);

    boolean existsByUser_IdUserAndStatus(Long userId, StatusC status);

    boolean existsByUser_IdUserAndStatusIn(Long userId, List<StatusC> statuses);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Credit c SET c.status = :rejected, c.offerExpiresAt = null "
            + "WHERE c.status = :offerPending AND c.offerExpiresAt IS NOT NULL AND c.offerExpiresAt < :now")
    int expireStaleOffers(
            @Param("offerPending") StatusC offerPending,
            @Param("rejected") StatusC rejected,
            @Param("now") Instant now);
}

