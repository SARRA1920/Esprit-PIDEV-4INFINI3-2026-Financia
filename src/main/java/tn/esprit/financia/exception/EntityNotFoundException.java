package tn.esprit.financia.exception;

import java.util.Map;

public class EntityNotFoundException extends FundManagementException {
    public EntityNotFoundException(String message) {
        super(message, "ENTITY_NOT_FOUND");
    }

    public EntityNotFoundException(String message, Map<String, Object> details) {
        super(message, "ENTITY_NOT_FOUND", details);
    }
}
