package tn.fiancia.financia.exception;

/**
 * Base exception for all application-specific errors.
 * Serves as the root exception class for the Financia application.
 */
public class FinanciaException extends RuntimeException {

    private final ErrorCode errorCode;

    public FinanciaException(String message, ErrorCode errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public FinanciaException(String message, ErrorCode errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
