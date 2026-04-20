package tn.fiancia.financia.services.base;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.fiancia.financia.exception.ResourceNotFoundException;

import java.io.Serializable;
import java.util.List;
import java.util.Optional;

/**
 * Generic base service providing common CRUD operations.
 * Reduces code duplication by providing reusable methods for entity operations.
 *
 * @param <E> The entity type
 * @param <ID> The ID type of the entity
 * @param <R> The repository type
 */
public abstract class BaseService<E, ID extends Serializable, R extends JpaRepository<E, ID>> {

    protected final R repository;
    protected final String entityName;

    public BaseService(R repository, String entityName) {
        this.repository = repository;
        this.entityName = entityName;
    }

    /**
     * Finds an entity by ID or throws ResourceNotFoundException.
     */
    protected E findByIdOrThrow(ID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(entityName, "id", id));
    }

    /**
     * Saves an entity to the database.
     */
    public E save(E entity) {
        return repository.save(entity);
    }

    /**
     * Finds an entity by ID.
     */
    public Optional<E> findById(ID id) {
        return repository.findById(id);
    }

    /**
     * Retrieves all entities.
     */
    public List<E> findAll() {
        return repository.findAll();
    }

    /**
     * Deletes an entity by ID.
     */
    public void deleteById(ID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(entityName, "id", id);
        }
        repository.deleteById(id);
    }

    /**
     * Deletes an entity.
     */
    public void delete(E entity) {
        repository.delete(entity);
    }

    /**
     * Saves multiple entities.
     */
    public List<E> saveAll(List<E> entities) {
        return repository.saveAll(entities);
    }

    /**
     * Checks if an entity exists by ID.
     */
    public boolean existsById(ID id) {
        return repository.existsById(id);
    }

    /**
     * Counts all entities.
     */
    public long count() {
        return repository.count();
    }
}
