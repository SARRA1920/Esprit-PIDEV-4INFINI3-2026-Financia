package tn.esprit.financia.config;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Session;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.sql.Statement;

/**
 * Hibernate {@code ddl-auto=update} n’élargit pas toujours les colonnes VARCHAR ni ne relâche les NOT NULL existants.
 * Ce runner applique les correctifs DDL attendus après le démarrage JPA.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSchemaFixes implements ApplicationRunner {

    private final EntityManager entityManager;

    @Override
    public void run(ApplicationArguments args) {
        // MySQL: rendre payment_date nullable si la colonne existe en NOT NULL.
        try {
            entityManager.createNativeQuery("ALTER TABLE remboursement MODIFY payment_date DATETIME NULL")
                    .executeUpdate();
        } catch (Exception e) {
            log.debug("remboursement.payment_date patch skipped: {}", e.getMessage());
        }

        // MySQL: statuts enum string longs (ex. OFFER_PENDING). DDL via JDBC (plus fiable que native query JPA).
        try {
            entityManager.unwrap(Session.class).doWork(connection -> {
                try (Statement st = connection.createStatement()) {
                    st.execute("ALTER TABLE credit MODIFY COLUMN status VARCHAR(32) NOT NULL");
                }
            });
            log.debug("credit.status column aligned to VARCHAR(32)");
        } catch (Exception e) {
            log.warn("credit.status widen failed (run manually if inserts fail): {}", e.getMessage());
        }
    }
}
