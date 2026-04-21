package tn.esprit.financia.service.user;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;

/**
 * Client HTTP vers le micro-service Python DeepFace.
 * Le service doit être démarré avec : python deepface_service.py
 */
@Service
public class FaceRecognitionService {

    private static final Logger log = LoggerFactory.getLogger(FaceRecognitionService.class);

    @Value("${face.service.url:http://localhost:5000}")
    private String faceServiceUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Compare une photo de référence (stockée en base) avec une photo saisie.
     *
     * @param referencePhoto bytes de la photo de référence
     * @param probeBase64    image saisie encodée en base64 (data:image/... ou raw)
     * @return résultat avec match + similarité
     */
    public FaceCompareResult compare(byte[] referencePhoto, String probeBase64) {
        String refBase64 = Base64.getEncoder().encodeToString(referencePhoto);

        Map<String, String> body = Map.of(
                "referenceImage", refBase64,
                "probeImage", probeBase64
        );

        try {
            String bodyJson = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(faceServiceUrl + "/compare"))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            JsonNode json = objectMapper.readTree(response.body());

            if (response.statusCode() == 422) {
                String errMsg = json.has("error") ? json.get("error").asText() : "Aucun visage détecté";
                return new FaceCompareResult(false, 0.0, 1.0, errMsg);
            }

            if (response.statusCode() != 200) {
                String errMsg = json.has("error") ? json.get("error").asText() : "Erreur du service de reconnaissance";
                throw new RuntimeException(errMsg);
            }

            boolean match = json.get("match").asBoolean();
            double similarity = json.get("similarity").asDouble();
            double distance = json.get("distance").asDouble();
            return new FaceCompareResult(match, similarity, distance, null);

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erreur lors de l'appel au service DeepFace", e);
            throw new RuntimeException("Le service de reconnaissance faciale est inaccessible. Assurez-vous que deepface_service.py est démarré.");
        }
    }

    public record FaceCompareResult(boolean match, double similarity, double distance, String errorMessage) {
        public boolean hasError() { return errorMessage != null; }
    }
}
