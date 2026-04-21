package tn.esprit.financia.exception;

/**
 * Exception thrown when a requested resource is not found in the database.
 */
public class ResourceNotFoundException extends FinanciaException {

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s : %s", resourceName, fieldName, fieldValue),
              ErrorCode.RESOURCE_NOT_FOUND);
    }

    public ResourceNotFoundException(String message) {
        super(message, ErrorCode.RESOURCE_NOT_FOUND);
    }
}
