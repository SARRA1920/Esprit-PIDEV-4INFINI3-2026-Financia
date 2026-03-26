package tn.esprit.financia.config;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Hibernate ddl-auto=update ne supprime pas toujours les contraintes NOT NULL existantes.
 * Ce runner aligne la base avec le workflow "échéance PENDING => payment_date NULL".
 */
@Component
@RequiredArgsConstructor
public class DatabaseSchemaFixes implements ApplicationRunner {

    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // MySQL: rendre payment_date nullable si la colonne existe en NOT NULL.
        // Idempotent: si déjà NULL, la requête passe sans impact.
        try {
            entityManager.createNativeQuery("ALTER TABLE remboursement MODIFY payment_date DATETIME NULL")
                    .executeUpdate();
        } catch (Exception ignored) {
            // On ignore pour ne pas bloquer le démarrage (ex: table inexistante au 1er run, droits insuffisants, autre SGBD).
        }
    }
}

