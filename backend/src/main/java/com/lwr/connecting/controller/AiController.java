package com.lwr.connecting.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AiController {

    @Value("${ai.provider:GEMINI}")
    private String aiProvider;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> handleAiChat(@RequestBody Map<String, Object> payload) {
        String prompt = payload.getOrDefault("prompt", "").toString().toLowerCase();
        String responseText = "";

        if (prompt.contains("cse") || prompt.contains("ece") || prompt.contains("branch")) {
            responseText = "**CSE vs ECE Insight:**\n- **Computer Science & Engineering (CSE)** focuses on software engineering, algorithms, system design, and AI. High industry demand across top tech companies.\n- **Electronics & Communication (ECE)** bridges hardware circuits, microprocessors, signal processing, and communication networks. It offers flexibility into both core VLSI/Embedded systems and software IT roles.\n\n*Based on verified platform database.*";
        } else if (prompt.contains("eapcet") || prompt.contains("prepare") || prompt.contains("math")) {
            responseText = "**AP EAPCET Preparation Roadmap:**\n1. **Focus on Mathematics (80 Marks)**: High-weightage topics include Matrices (14%), Trigonometry (12%), and Vectors & 3D.\n2. **Physics & Chemistry (40 Marks each)**: Practice speed-solving formulas. AP EAPCET has no negative marking.\n3. Take full 3-hour grand mock tests twice a week on our platform.";
        } else {
            responseText = "Hello! I am **LWR AI**, your dedicated B.Tech & Entrance Exam Assistant.\n\nI can help you with:\n- High-weightage topics in JEE & AP EAPCET\n- Comparing branches (CSE, AI/ML, ECE, Mechanical)\n- Finding colleges matching your target rank\n- Strategy to improve your mock test score!\n\nWhat would you like to explore today?";
        }

        Map<String, String> result = new HashMap<>();
        result.put("response", responseText);
        result.put("provider", aiProvider);
        return ResponseEntity.ok(result);
    }
}
