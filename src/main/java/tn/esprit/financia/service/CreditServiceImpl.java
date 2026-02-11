package tn.esprit.financia.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.entities.Credit;
import tn.esprit.financia.entities.User;
import tn.esprit.financia.repository.CreditRepository;
import tn.esprit.financia.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CreditServiceImpl implements CreditService {

    private final CreditRepository creditRepository;
    private final UserRepository userRepository;

    @Override
    public Credit create(Credit credit, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        credit.setUser(user);
        return creditRepository.save(credit);
    }

    @Override
    @Transactional(readOnly = true)
    public Credit getById(Long id) {
        return creditRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Credit> getAll() {
        return creditRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Credit> getByUser(Long userId) {
        return creditRepository.findByUser_IdUser(userId);
    }

    @Override
    public Credit update(Long id, Credit updated) {
        Credit existing = getById(id);

        if (updated.getAmount() != null) existing.setAmount(updated.getAmount());
        if (updated.getInterestRate() != null) existing.setInterestRate(updated.getInterestRate());
        if (updated.getDurationMonths() != null) existing.setDurationMonths(updated.getDurationMonths());
        if (updated.getStartDate() != null) existing.setStartDate(updated.getStartDate());
        if (updated.getEndDate() != null) existing.setEndDate(updated.getEndDate());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getRiskScore() != null) existing.setRiskScore(updated.getRiskScore());

        // user non modifiable ici (sinon incohérence)
        return creditRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        creditRepository.delete(getById(id));
    }
}
