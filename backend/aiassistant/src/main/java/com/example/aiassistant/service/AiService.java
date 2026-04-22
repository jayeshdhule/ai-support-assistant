package com.example.aiassistant.service;

import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiService {

    // ✅ TEMP: Hardcoded key (for testing)
    private final String API_KEY = "AIzaSyDPnn4wcL75sLNOMslRzwHtEJaTOnz-SnU";

    private List<String> conversationMemory = new ArrayList<>();

    @SuppressWarnings("unchecked")
    public String getResponse(String userMessage, String sessionId) {

        try {
            // 🔍 Debug
            System.out.println("API KEY: " + API_KEY);

            RestTemplate restTemplate = new RestTemplate();

            // ✅ Correct endpoint + model
            String url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 🧠 Add user message
            conversationMemory.add("User: " + userMessage);

            if (conversationMemory.size() > 5) {
                conversationMemory.remove(0);
            }

            // 🧠 Build prompt
            StringBuilder prompt = new StringBuilder();
            for (String msg : conversationMemory) {
                prompt.append(msg).append("\n");
            }

            // 📦 Request body
            Map<String, Object> body = new HashMap<>();
            body.put("contents", List.of(
                    Map.of("parts", List.of(
                            Map.of("text", prompt.toString())
                    ))
            ));

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(body, headers);

            // 🔥 API call
            ResponseEntity<Map> response =
                    restTemplate.postForEntity(url, request, Map.class);

            System.out.println("API RESPONSE: " + response.getBody());

            Map<String, Object> responseBody =
                    (Map<String, Object>) response.getBody();

            // ❌ Handle API error
            if (responseBody == null || responseBody.containsKey("error")) {
                return "Demo Response: API error or quota exceeded";
            }

            List<Map<String, Object>> candidates =
                    (List<Map<String, Object>>) responseBody.get("candidates");

            if (candidates == null || candidates.isEmpty()) {
                return "No response from AI";
            }

            Map<String, Object> content =
                    (Map<String, Object>) candidates.get(0).get("content");

            List<Map<String, Object>> parts =
                    (List<Map<String, Object>>) content.get("parts");

            String aiReply = parts.get(0).get("text").toString();

            // 🧠 Save AI reply
            conversationMemory.add("AI: " + aiReply);

            return aiReply;

        } catch (Exception e) {
            e.printStackTrace();

            // 🔥 fallback (never break app)
            return "Demo Response: Server error fallback";
        }
    }
}