package com.example.expense_tracker.exception;

import java.time.LocalDateTime;
import java.util.Map;

public class ErrorResponse {

    private String message;
    private int status;
    private Map<String, String> errors;
    private LocalDateTime timestamp;

    public ErrorResponse(String message, int status, Map<String, String> errors) {
        this.message = message;
        this.status = status;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }

    public String getMessage() { return message; }
    public int getStatus() { return status; }
    public Map<String, String> getErrors() { return errors; }
    public LocalDateTime getTimestamp() { return timestamp; }
}