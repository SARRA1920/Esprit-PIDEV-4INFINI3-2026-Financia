package tn.esprit.financia.repository.savings;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.financia.entities.savings.SavingsAuditLog;

import java.util.List;

public interface SavingsAuditLogRepository extends JpaRepository<SavingsAuditLog, Long> {

    List<SavingsAuditLog> findTop200ByOrderByCreatedAtDesc();
}
