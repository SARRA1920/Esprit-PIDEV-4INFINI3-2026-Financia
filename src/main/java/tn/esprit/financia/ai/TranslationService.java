package tn.esprit.financia.ai;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class TranslationService {

    private static final String MYMEMORY_API_URL = "https://api.mymemory.translated.net/get";

    private final RestTemplate restTemplate = new RestTemplate();


    public String translate(String text, String target) {
        if (text == null || text.isBlank()) {
            return "";
        }

        try {
            return translateViaMyMemory(text, target);
        } catch (Exception e) {
            e.printStackTrace();
            return text; 
        }
    }


    public String detectLanguage(String text) {
        if (text == null || text.isBlank()) {
            return "en";
        }

        try {
            if (text.matches(".*[\\u0600-\\u06FF]+.*")) {
                return "ar"; 
            } else if (text.contains("é") || text.contains("è") || text.contains("ê")) {
                return "fr"; 
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "en"; 
    }

    public Map<String, String> translateToMultiLanguages(String text) {
        Map<String, String> translations = new HashMap<>();

        if (text == null || text.isBlank()) {
            translations.put("en", "");
            translations.put("fr", "");
            translations.put("ar", "");
            return translations;
        }

        try {
            String detectedLang = detectLanguage(text);

            if ("en".equals(detectedLang)) {
                translations.put("en", text);
                translations.put("fr", translateViaMyMemory(text, "fr"));
                translations.put("ar", translateViaMyMemory(text, "ar"));
            } else if ("fr".equals(detectedLang)) {
                translations.put("en", translateViaMyMemory(text, "en"));
                translations.put("fr", text);
                translations.put("ar", translateViaMyMemory(text, "ar"));
            } else if ("ar".equals(detectedLang)) {
                translations.put("en", translateViaMyMemory(text, "en"));
                translations.put("fr", translateViaMyMemory(text, "fr"));
                translations.put("ar", text);
            }
        } catch (Exception e) {
            e.printStackTrace();
            translations.put("en", text);
            translations.put("fr", text);
            translations.put("ar", text);
        }

        return translations;
    }

    private String translateViaMyMemory(String text, String target) throws Exception {
        try {
            String url = String.format("%s?q=%s&langpair=en|%s", 
                MYMEMORY_API_URL, 
                java.net.URLEncoder.encode(text, "UTF-8"), 
                target);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("responseData")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseData = (Map<String, Object>) response.get("responseData");
                if (responseData != null && responseData.containsKey("translatedText")) {
                    String translatedText = (String) responseData.get("translatedText");
                    if (translatedText != null && !translatedText.isBlank()) {
                        return translatedText;
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return text;
    }
}

