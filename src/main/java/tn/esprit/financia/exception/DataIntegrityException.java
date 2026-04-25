package tn.esprit.financia.exception;

import java.util.Map;

public class DataIntegrityException extends FundManagementException {
    public DataIntegrityException(String message) {
        super(message, "DATA_INTEGRITY_ERROR");
    }

    public DataIntegrityException(String message, Map<String, Object> details) {
        super(message, "DATA_INTEGRITY_ERROR", details);
    }

    public DataIntegrityException(String message, Throwable cause) {
        super(message, "DATA_INTEGRITY_ERROR", cause);
    }
}
