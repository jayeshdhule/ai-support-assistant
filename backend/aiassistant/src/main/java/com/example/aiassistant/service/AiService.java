package com.example.aiassistant.service;

import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;


@Service
public class AiService {

    private final String API_KEY = "YOUR_API_KEY";

    private List<Map<String, String>> conversationMemory = new ArrayList<>();

    public String getResponse(String userMessage, String sessionId) {

        RestTemplate restTemplate = new RestTemplate();

        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(API_KEY);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Add user message to memory
        conversationMemory.add(Map.of("role", "user", "content", userMessage));

        // Keep only last 5 messages (context window)
        if (conversationMemory.size() > 5) {
            conversationMemory.remove(0);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");
        body.put("messages", conversationMemory);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        List choices = (List) response.getBody().get("choices");
        Map choice = (Map) choices.get(0);
        Map messageObj = (Map) choice.get("message");

        String aiReply = messageObj.get("content").toString();

        // Add AI response to memory
        conversationMemory.add(Map.of("role", "assistant", "content", aiReply));

        return aiReply;
    }
}