package tn.esprit.financia.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.Partenaire;
import tn.esprit.financia.repository.PartenaireRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class PartenaireServiceImpl implements IPartenaireService {

    private final PartenaireRepository partenaireRepository;

    @Override
    public List<Partenaire> findAll() {
        return partenaireRepository.findAll();
    }

    @Override
    public Partenaire findById(Long id) {
        return partenaireRepository.findById(id).orElse(null);
    }

    @Override
    public Partenaire save(Partenaire partenaire) {
        return partenaireRepository.save(partenaire);
    }

    @Override
    public void deleteById(Long id) {
        partenaireRepository.deleteById(id);
    }
}