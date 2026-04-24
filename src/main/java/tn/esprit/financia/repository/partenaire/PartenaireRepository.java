package tn.esprit.financia.repository.partenaire;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.financia.entities.partenaire.Partenaire;

@Repository
public interface PartenaireRepository extends JpaRepository<Partenaire, Long> {
}