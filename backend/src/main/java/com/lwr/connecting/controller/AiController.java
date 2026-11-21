package com.lwr.connecting.controller;

import com.lwr.connecting.service.ai.AiAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/ai", "/api/ai"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AiController {

    private final AiAssistantService aiAssistantService;

    @PostMapping("/chat")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> handleAiChat(@RequestBody Map<String, Object> payload) {
        String prompt = "";
        if (payload.get("prompt") != null) {
            prompt = payload.get("prompt").toString();
        } else if (payload.get("message") != null) {
            prompt = payload.get("message").toString();
        } else if (payload.get("query") != null) {
            prompt = payload.get("query").toString();
        }

        List<Map<String, String>> history = (List<Map<String, String>>) payload.get("history");
        Map<String, Object> studentContext = (Map<String, Object>) payload.get("studentContext");

        Map<String, Object> response = aiAssistantService.processChat(prompt, history, studentContext);
        return ResponseEntity.ok(response);
    }
}
