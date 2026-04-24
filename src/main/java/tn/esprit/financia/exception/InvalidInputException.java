package tn.esprit.financia.exception;

import java.util.Map;

public class InvalidInputException extends FundManagementException {
    public InvalidInputException(String message) {
        super(message, "INVALID_INPUT");
    }

    public InvalidInputException(String message, Map<String, Object> details) {
        super(message, "INVALID_INPUT", details);
    }
}
