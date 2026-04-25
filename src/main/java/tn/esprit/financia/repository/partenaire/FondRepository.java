package tn.esprit.financia.repository.partenaire;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.financia.entities.partenaire.Fond;

@Repository
public interface FondRepository extends JpaRepository<Fond, Long> {
}