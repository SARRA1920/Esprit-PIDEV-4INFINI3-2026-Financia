package tn.esprit.financia.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.entities.Contrat;
import tn.esprit.financia.entities.Credit;
import tn.esprit.financia.entities.User;
import tn.esprit.financia.repository.ContratRepository;
import tn.esprit.financia.repository.CreditRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContratServiceImpl implements ContratService {

    private final ContratRepository contratRepository;
    private final CreditRepository creditRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public Contrat create(Contrat contrat, Long creditId) {
        Credit credit = creditRepository.findById(creditId)
                .orElseThrow(() -> new RuntimeException("Credit not found with id: " + creditId));
        contrat.setCredit(credit);
        Contrat savedContrat = contratRepository.save(contrat);
        
        // Send email to customer
        try {
            User user = credit.getUser();
            emailService.sendContractEmail(savedContrat, user);
            log.info("Contract email sent successfully for contract ID: {}", savedContrat.getId());
        } catch (Exception e) {
            log.error("Failed to send contract email for contract ID: {}", savedContrat.getId(), e);
            // Don't fail the transaction if email fails
        }
        
        return savedContrat;
    }

    @Override
    public Contrat getById(Long id) {
        return contratRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat not found with id: " + id));
    }

    @Override
    public List<Contrat> getAll() {
        return contratRepository.findAll();
    }

    @Override
    public Contrat getByCreditId(Long creditId) {
        return contratRepository.findByCreditId(creditId)
                .orElseThrow(() -> new RuntimeException("Contrat not found for credit id: " + creditId));
    }

    @Override
    @Transactional
    public Contrat update(Long id, Contrat contrat) {
        Contrat existing = getById(id);
        existing.setSignedDate(contrat.getSignedDate());
        existing.setAmount(contrat.getAmount());
        existing.setRate(contrat.getRate());
        existing.setDuration(contrat.getDuration());
        existing.setStatus(contrat.getStatus());
        existing.setVersion(contrat.getVersion());
        existing.setType(contrat.getType());
        
        // Update penalty configuration if provided
        if (contrat.getPenaltyRate() != null) {
            existing.setPenaltyRate(contrat.getPenaltyRate());
        }
        if (contrat.getPenaltyType() != null) {
            existing.setPenaltyType(contrat.getPenaltyType());
        }
        if (contrat.getGracePeriodDays() != null) {
            existing.setGracePeriodDays(contrat.getGracePeriodDays());
        }
        
        return contratRepository.save(existing);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        contratRepository.deleteById(id);
    }
}
