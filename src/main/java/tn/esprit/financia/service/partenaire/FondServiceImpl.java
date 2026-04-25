package tn.esprit.financia.service.partenaire;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.partenaire.Fond;
import tn.esprit.financia.repository.partenaire.FondRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class FondServiceImpl implements IFondService {

    private final FondRepository fondRepository;

    @Override
    public List<Fond> findAll() {
        return fondRepository.findAll();
    }

    @Override
    public Fond findById(Long id) {
        return fondRepository.findById(id).orElse(null);
    }

    @Override
    public Fond save(Fond fond) {
        return fondRepository.save(fond);
    }

    @Override
    public void deleteById(Long id) {
        fondRepository.deleteById(id);
    }
}