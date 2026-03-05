package tn.esprit.financia.exception;

import java.util.Map;

public class ImmutabilityViolationException extends FundManagementException {
    public ImmutabilityViolationException(String message) {
        super(message, "IMMUTABILITY_VIOLATION");
    }

    public ImmutabilityViolationException(String message, Map<String, Object> details) {
        super(message, "IMMUTABILITY_VIOLATION", details);
    }
}
