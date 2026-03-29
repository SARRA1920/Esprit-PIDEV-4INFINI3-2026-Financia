package tn.esprit.financia.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.PartenaireFond;
import tn.esprit.financia.repository.PartenaireFondRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class PartenaireFondServiceImpl implements IPartenaireFondService {

    private final PartenaireFondRepository partenaireFondRepository;

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
        return partenaireFondRepository.save(partenaireFond);
    }

    @Override
    public void deleteById(Long id) {
        partenaireFondRepository.deleteById(id);
    }
}