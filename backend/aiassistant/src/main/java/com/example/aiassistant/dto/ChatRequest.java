package com.example.aiassistant.dto;

import java.util.List;

public class ChatRequest {

    private String message;
    private String sessionId;   // to track user session (important for memory)
    private List<Message> history; // optional: frontend sends chat history

    // getters & setters

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public List<Message> getHistory() {
        return history;
    }

    public void setHistory(List<Message> history) {
        this.history = history;
    }
}