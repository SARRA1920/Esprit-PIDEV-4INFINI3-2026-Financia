package tn.esprit.financia.service;

import tn.esprit.financia.entities.Credit;
import java.util.List;

public interface CreditService {
    Credit create(Credit credit, Long userId);
    Credit getById(Long id);
    List<Credit> getAll();
    List<Credit> getByUser(Long userId);
    Credit update(Long id, Credit credit);
    Credit recalculateRisk(Long creditId);
    Credit updateRiskAfterPayment(Long creditId);
    void delete(Long id);
}
