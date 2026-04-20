package tn.fiancia.financia;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application entry point for the Financia educational platform.
 * Initializes the Spring Boot application and all its components.
 */
@SpringBootApplication
@Slf4j
public class FinanciaApplication {

    public static void main(String[] args) {
        log.info("Starting Financia Application...");
        SpringApplication.run(FinanciaApplication.class, args);
        log.info("Financia Application started successfully");
        log.info("Server running on context path: /f");
    }
}
