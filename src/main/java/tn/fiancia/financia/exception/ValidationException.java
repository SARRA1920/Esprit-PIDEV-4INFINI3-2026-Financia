package tn.fiancia.financia.exception;

/**
 * Exception thrown when input validation fails.
 */
public class ValidationException extends FinanciaException {

    public ValidationException(String message) {
        super(message, ErrorCode.VALIDATION_ERROR);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, ErrorCode.VALIDATION_ERROR, cause);
    }
}
