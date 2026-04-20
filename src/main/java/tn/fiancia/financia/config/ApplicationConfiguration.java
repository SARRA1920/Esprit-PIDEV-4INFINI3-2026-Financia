package tn.fiancia.financia.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Main application configuration class.
 * Centralizes Spring bean definitions and configuration.
 */
@Configuration
public class ApplicationConfiguration {

    /**
     * Creates a RestTemplate bean for HTTP client operations.
     * Used for external API calls like translation services.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
