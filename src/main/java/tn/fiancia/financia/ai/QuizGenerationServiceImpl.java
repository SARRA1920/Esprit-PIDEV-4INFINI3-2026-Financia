package tn.fiancia.financia.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;
import tn.fiancia.financia.entities.LessonContent;

@Service
public class QuizGenerationServiceImpl implements QuizGenerationService {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String generateQuiz(LessonContent content) {
        if (content == null || content.getTextContent() == null || content.getTextContent().isBlank()) {
            return "{\"questions\": []}";
        }

        try {
            Client client = Client.builder().apiKey("AIzaSyDtpn3gnef9qORwWLc8QXygJaJ6M73M5rU").build();


            String prompt = """
                    Generate 3 to 5 multiple choice questions from the following text.
                    Each question must have exactly 3 options and one correct answer.
                    Return only valid JSON in this format:
                    {
                      "questions": [
                        {"id":0,"text":"...","options":["...","...","..."],"answer":0}
                      ]
                    }

                    Lesson text:
                    """ + content.getTextContent();

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3-flash-preview",
                            prompt,
                            null
                    );

            String modelOutput = response.text();

            // Validate JSON
            try {
                @SuppressWarnings("unused")
                JsonNode node = mapper.readTree(modelOutput);
                return modelOutput;
            } catch (Exception e) {
                return "{\"questions\": []}";
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"questions\": []}";
        }
    }
}