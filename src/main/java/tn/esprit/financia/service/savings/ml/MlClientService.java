package tn.esprit.financia.service.savings.ml;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import tn.esprit.financia.dto.savings.ml.FraudRequest;
import tn.esprit.financia.dto.savings.ml.FraudResponse;

import java.util.List;

@Service
public class MlClientService {

    private static final Logger log = LoggerFactory.getLogger(MlClientService.class);

    @Value("${ml.service.url:http://localhost:5001}")
    private String mlServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    public FraudResponse analyzeFraud(FraudRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<FraudRequest> entity = new HttpEntity<>(request, headers);

        try {
            String url = mlServiceUrl + "/fraud";
            log.debug("Calling ML service: {} for account {}", url, request.getAccountId());

            ResponseEntity<FraudResponse> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, FraudResponse.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.debug("ML analysis successful for account {}: score={}",
                        request.getAccountId(), response.getBody().getScore());
                return response.getBody();
            } else {
                log.warn(" ML service returned bad response for account {}: {}",
                        request.getAccountId(), response.getStatusCode());
            }
        } catch (RestClientException e) {
            log.error(" ML service FAILED for account {}: {}",
                    request.getAccountId(), e.getMessage(), e);
        } catch (Exception e) {
            log.error(" Unexpected error calling ML service for account {}: {}",
                    request.getAccountId(), e.getMessage(), e);
        }

        // 🛡️ FALLBACK RESPONSE (Using constructor)
        return new FraudResponse(
                -1.0,                                    // score
                false,                                   // isHighRisk
                List.of(" ML service temporarily unavailable - using rule-based detection")  // reasons
        );
    }
}