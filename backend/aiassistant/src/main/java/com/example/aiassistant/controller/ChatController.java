package com.example.aiassistant.controller;

import com.example.aiassistant.dto.ChatRequest;
import com.example.aiassistant.dto.ChatResponse;
import com.example.aiassistant.service.AiService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@RestController
public class ChatController {

    @Autowired
    private AiService aiService;

  @PostMapping
public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {

    String reply = aiService.getResponse(
        request.getMessage(),
        request.getSessionId()
    );

    ChatResponse response = new ChatResponse(reply, request.getSessionId());

    return ResponseEntity.ok(response);
}
}