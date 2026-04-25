package tn.esprit.financia.exception;

import java.util.HashMap;
import java.util.Map;

public class FundManagementException extends RuntimeException {
    private final String errorCode;
    private final Map<String, Object> details;

    public FundManagementException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }

    public FundManagementException(String message, String errorCode, Map<String, Object> details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details != null ? new HashMap<>(details) : new HashMap<>();
    }

    public FundManagementException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Map<String, Object> getDetails() {
        return new HashMap<>(details);
    }

    public void addDetail(String key, Object value) {
        this.details.put(key, value);
    }
}
