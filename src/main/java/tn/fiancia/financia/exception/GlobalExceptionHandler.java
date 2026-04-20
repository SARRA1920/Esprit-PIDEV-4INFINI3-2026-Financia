package tn.fiancia.financia.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import tn.fiancia.financia.dto.ApiResponse;

/**
 * Global exception handler for the application.
 * Provides centralized error handling and consistent error response format.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handles ResourceNotFoundException.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        
        ApiResponse<?> response = ApiResponse.error(
                ex.getErrorCode().getCode(),
                ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles ValidationException.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(
            ValidationException ex, WebRequest request) {
        log.warn("Validation error: {}", ex.getMessage());
        
        ApiResponse<?> response = ApiResponse.error(
                ex.getErrorCode().getCode(),
                ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles FinanciaException (base application exception).
     */
    @ExceptionHandler(FinanciaException.class)
    public ResponseEntity<ApiResponse<?>> handleFinanciaException(
            FinanciaException ex, WebRequest request) {
        log.error("Application error: {}", ex.getMessage(), ex);
        
        ApiResponse<?> response = ApiResponse.error(
                ex.getErrorCode().getCode(),
                ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handles IllegalArgumentException.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        log.warn("Invalid argument: {}", ex.getMessage());
        
        ApiResponse<?> response = ApiResponse.error(
                ErrorCode.INVALID_INPUT.getCode(),
                ex.getMessage());
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles all other exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGlobalException(
            Exception ex, WebRequest request) {
        log.error("Unexpected error occurred", ex);
        
        ApiResponse<?> response = ApiResponse.error(
                ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                "An unexpected error occurred. Please try again later.");
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
