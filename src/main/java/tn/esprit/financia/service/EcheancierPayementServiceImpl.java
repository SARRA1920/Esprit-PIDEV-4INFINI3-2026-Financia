package tn.esprit.financia.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.entities.Contrat;
import tn.esprit.financia.entities.EcheancierPayement;
import tn.esprit.financia.entities.User;
import tn.esprit.financia.entities.enums.StatusE;
import tn.esprit.financia.repository.ContratRepository;
import tn.esprit.financia.repository.EcheancierPayementRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EcheancierPayementServiceImpl implements EcheancierPayementService {

    private final EcheancierPayementRepository echeancierRepository;
    private final ContratRepository contratRepository;
    private final WhatsAppService whatsAppService;

    @Override
    @Transactional
    public EcheancierPayement create(EcheancierPayement echeancier, Long contratId) {
        Contrat contrat = contratRepository.findById(contratId)
                .orElseThrow(() -> new RuntimeException("Contrat not found with id: " + contratId));
        echeancier.setContrat(contrat);
        
        // Automatically check if payment is overdue based on due date
        if (echeancier.getStatus() == StatusE.PENDING && 
            echeancier.getDueDate() != null && 
            echeancier.getDueDate().isBefore(java.time.LocalDate.now())) {
            
            log.info("Payment due date {} is in the past. Automatically marking as OVERDUE", echeancier.getDueDate());
            echeancier.setStatus(StatusE.OVERDUE);
            echeancier.setOverdueDate(java.time.LocalDate.now());
            
            // Calculate days overdue
            long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(
                echeancier.getDueDate(), 
                java.time.LocalDate.now()
            );
            echeancier.setDaysOverdue((int) daysOverdue);
        }
        
        EcheancierPayement savedEcheancier = echeancierRepository.save(echeancier);
        
        // Send WhatsApp if status is OVERDUE
        if (savedEcheancier.getStatus() == StatusE.OVERDUE) {
            sendOverdueWhatsApp(savedEcheancier);
        }
        
        return savedEcheancier;
    }

    @Override
    public EcheancierPayement getById(Long id) {
        return echeancierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("EcheancierPayement not found with id: " + id));
    }

    @Override
    public List<EcheancierPayement> getAll() {
        return echeancierRepository.findAll();
    }

    @Override
    public List<EcheancierPayement> getByContratId(Long contratId) {
        return echeancierRepository.findByContratId(contratId);
    }

    @Override
    @Transactional
    public EcheancierPayement update(Long id, EcheancierPayement echeancier) {
        EcheancierPayement existing = getById(id);
        
        // Check if status is changing to OVERDUE
        boolean statusChangedToOverdue = existing.getStatus() != StatusE.OVERDUE 
            && echeancier.getStatus() == StatusE.OVERDUE;
        
        existing.setDueDate(echeancier.getDueDate());
        existing.setAmountDue(echeancier.getAmountDue());
        existing.setPrincipalAmount(echeancier.getPrincipalAmount());
        existing.setInterestAmount(echeancier.getInterestAmount());
        existing.setPenaltyAmount(echeancier.getPenaltyAmount());
        existing.setStatus(echeancier.getStatus());
        
        EcheancierPayement updated = echeancierRepository.save(existing);
        
        // Send WhatsApp if status changed to OVERDUE
        if (statusChangedToOverdue) {
            sendOverdueWhatsApp(updated);
        }
        
        return updated;
    }

    /**
     * Send WhatsApp notification when payment becomes overdue
     */
    private void sendOverdueWhatsApp(EcheancierPayement echeancier) {
        try {
            User user = echeancier.getContrat().getCredit().getUser();
            
            if (user.getPhone() != null && !user.getPhone().isEmpty()) {
                String message = buildOverdueMessage(echeancier, user);
                whatsAppService.sendWhatsApp(user.getPhone(), message);
                log.info("Overdue WhatsApp sent to user {} for payment {}", user.getIdUser(), echeancier.getId());
            } else {
                log.warn("Cannot send WhatsApp: User {} has no phone number", user.getIdUser());
            }
        } catch (Exception e) {
            log.error("Failed to send overdue WhatsApp for payment {}: {}", echeancier.getId(), e.getMessage());
            // Don't fail the transaction if WhatsApp fails
        }
    }

    /**
     * Build overdue notification message
     */
    private String buildOverdueMessage(EcheancierPayement echeancier, User user) {
        return String.format(
            "🔔 *Financia - Alerte de Retard*\n\n" +
            "Bonjour *%s*,\n\n" +
            "Votre paiement du *%s* est maintenant en retard.\n\n" +
            "💰 Montant dû: *%.3f TND*\n\n" +
            "⚠️ Merci de régulariser votre situation rapidement pour éviter des pénalités supplémentaires.\n\n" +
            "_Financia - Votre partenaire financier_",
            user.getFirstName(),
            echeancier.getDueDate(),
            echeancier.getAmountDue()
        );
    }

    @Override
    @Transactional
    public void delete(Long id) {
        echeancierRepository.deleteById(id);
    }
}
