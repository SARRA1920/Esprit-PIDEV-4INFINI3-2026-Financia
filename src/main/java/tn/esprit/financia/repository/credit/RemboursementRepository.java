package tn.esprit.financia.repository.credit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.financia.entities.credit.PaymentStatus;
import tn.esprit.financia.entities.credit.Remboursement;

import java.time.LocalDate;
import java.util.List;

public interface RemboursementRepository extends JpaRepository<Remboursement, Long>, JpaSpecificationExecutor<Remboursement> {
    List<Remboursement> findByCredit_Id(Long creditId);

    @Query("""
            select count(r)
            from Remboursement r
            where r.status = :status
              and r.dueDate is not null
              and r.dueDate < :today
            """)
    long countOverdueInstallments(@Param("status") PaymentStatus status, @Param("today") LocalDate today);

    @Query("""
            select count(distinct r.credit.id)
            from Remboursement r
            where r.status = :status
              and r.dueDate is not null
              and r.dueDate < :today
            """)
    long countDistinctOverdueCredits(@Param("status") PaymentStatus status, @Param("today") LocalDate today);

    @Query("select max(coalesce(r.lateDays, 0)) from Remboursement r")
    Integer maxLateDaysOverall();
}

