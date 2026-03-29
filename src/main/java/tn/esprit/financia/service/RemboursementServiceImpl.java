package tn.esprit.financia.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.entities.Credit;
import tn.esprit.financia.entities.Remboursement;
import tn.esprit.financia.repository.CreditRepository;
import tn.esprit.financia.repository.RemboursementRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RemboursementServiceImpl implements RemboursementService {

    private final RemboursementRepository remboursementRepository;
    private final CreditRepository creditRepository;

    @Override
    public Remboursement create(Remboursement remboursement, Long creditId) {
        Credit credit = creditRepository.findById(creditId)
                .orElseThrow(() -> new RuntimeException("Credit not found"));

        remboursement.setCredit(credit);
        return remboursementRepository.save(remboursement);
    }

    @Override
    @Transactional(readOnly = true)
    public Remboursement getById(Long id) {
        return remboursementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Remboursement not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Remboursement> getAll() {
        return remboursementRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Remboursement> getByCredit(Long creditId) {
        return remboursementRepository.findByCredit_Id(creditId);
    }

    @Override
    public Remboursement update(Long id, Remboursement updated) {
        Remboursement existing = getById(id);

        if (updated.getAmount() != null) existing.setAmount(updated.getAmount());
        if (updated.getPaymentDate() != null) existing.setPaymentDate(updated.getPaymentDate());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        // credit non modifiable ici

        return remboursementRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        remboursementRepository.delete(getById(id));
    }
}
