package tn.esprit.financia.service;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.PartenaireFond;
import tn.esprit.financia.repository.PartenaireFondRepository;

import java.util.List;

@Service
public class PartenaireFondServiceImpl implements IPartenaireFondService {

    private final PartenaireFondRepository partenaireFondRepository;
    private final IPartenaireService partenaireService;

    @Autowired
    public PartenaireFondServiceImpl(PartenaireFondRepository partenaireFondRepository, @Lazy IPartenaireService partenaireService) {
        this.partenaireFondRepository = partenaireFondRepository;
        this.partenaireService = partenaireService;
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
        if (savedPartenaireFond.getPartenaire() != null) {
            partenaireService.updatePartnerStatus(savedPartenaireFond.getPartenaire().getIdPartenaire());
        }
        return savedPartenaireFond;
    }

    @Override
    public void deleteById(Long id) {
        partenaireFondRepository.deleteById(id);
    }
}