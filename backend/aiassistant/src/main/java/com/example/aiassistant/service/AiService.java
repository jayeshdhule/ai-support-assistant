package com.example.aiassistant.service;

import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiService {

    private final String API_KEY = System.getenv("GEMINI_API_KEY");

    private List<String> conversationMemory = new ArrayList<>();

    @SuppressWarnings("unchecked")
    public String getResponse(String userMessage, String sessionId) {

        try {
            RestTemplate restTemplate = new RestTemplate();

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            conversationMemory.add("User: " + userMessage);

            if (conversationMemory.size() > 5) {
                conversationMemory.remove(0);
            }

            StringBuilder prompt = new StringBuilder();
            for (String msg : conversationMemory) {
                prompt.append(msg).append("\n");
            }

            Map<String, Object> body = new HashMap<>();
            body.put("contents", List.of(
                    Map.of("parts", List.of(
                            Map.of("text", prompt.toString())
                    ))
            ));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(url, request, Map.class);

            System.out.println("API RESPONSE: " + response.getBody());

            Map<String, Object> responseBody =
                    (Map<String, Object>) response.getBody();

            if (responseBody == null || responseBody.containsKey("error")) {
                return "Error from Gemini API: " + responseBody;
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

            conversationMemory.add("AI: " + aiReply);

            return aiReply;

        } catch (Exception e) {
            e.printStackTrace();
            return "Server error: " + e.getMessage();
        }
    }
}