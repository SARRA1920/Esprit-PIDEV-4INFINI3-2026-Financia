package tn.esprit.financia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.financia.entities.PartenaireFond;

@Repository
public interface PartenaireFondRepository extends JpaRepository<PartenaireFond, Long> {
}