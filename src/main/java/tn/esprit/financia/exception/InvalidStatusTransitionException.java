package tn.esprit.financia.exception;

import java.util.Map;

public class InvalidStatusTransitionException extends FundManagementException {
    public InvalidStatusTransitionException(String message) {
        super(message, "INVALID_STATUS_TRANSITION");
    }

    public InvalidStatusTransitionException(String message, Map<String, Object> details) {
        super(message, "INVALID_STATUS_TRANSITION", details);
    }
}
