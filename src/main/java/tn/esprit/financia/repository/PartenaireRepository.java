package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.financia.entities.Partenaire;

@Repository
public interface PartenaireRepository extends JpaRepository<Partenaire, Long> {
}