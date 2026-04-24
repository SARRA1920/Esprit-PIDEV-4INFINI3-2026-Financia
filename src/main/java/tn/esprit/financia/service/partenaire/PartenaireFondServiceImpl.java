package tn.esprit.financia.service.partenaire;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.partenaire.PartenaireFond;
import tn.esprit.financia.repository.partenaire.PartenaireFondRepository;

import java.util.List;

@Service
public class PartenaireFondServiceImpl implements IPartenaireFondService {

    private final PartenaireFondRepository partenaireFondRepository;
    private final IPartenaireService partenaireService;
    private final IFundStatusManager fundStatusManager;

    @Autowired
    public PartenaireFondServiceImpl(PartenaireFondRepository partenaireFondRepository, 
                                      @Lazy IPartenaireService partenaireService,
                                      IFundStatusManager fundStatusManager) {
        this.partenaireFondRepository = partenaireFondRepository;
        this.partenaireService = partenaireService;
        this.fundStatusManager = fundStatusManager;
    }

    @Override
    public List<PartenaireFond> findAll() {
        return partenaireFondRepository.findAll();
    }

    @Override
    public PartenaireFond findById(Long id) {
        return partenaireFondRepository.findById(id).orElse(null);
    }

    @Override
    public PartenaireFond save(PartenaireFond partenaireFond) {
        PartenaireFond savedPartenaireFond = partenaireFondRepository.save(partenaireFond);
        
        // Update partner status
        if (savedPartenaireFond.getPartenaire() != null) {
            partenaireService.updatePartnerStatus(savedPartenaireFond.getPartenaire().getIdPartenaire());
        }
        
        // Recalculate fund's committed amount and status
        if (savedPartenaireFond.getFond() != null) {
            fundStatusManager.recalculateStatus(savedPartenaireFond.getFond().getIdFond());
        }
        
        return savedPartenaireFond;
    }

    @Override
    public void deleteById(Long id) {
        partenaireFondRepository.deleteById(id);
    }
}