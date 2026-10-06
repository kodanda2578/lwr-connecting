package com.lwr.connecting.controller;

import com.lwr.connecting.dto.*;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.enums.TestType;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.service.MockTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mock-tests")
@RequiredArgsConstructor
public class MockTestController {

    private final MockTestService mockTestService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<TestDTO>> getAvailableTests(
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) TestType testType) {
        return ResponseEntity.ok(mockTestService.getAvailableTests(examId, testType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestDTO> getTestById(@PathVariable Long id) {
        return ResponseEntity.ok(mockTestService.getTestById(id, true));
    }

    @PostMapping("/generate")
    public ResponseEntity<TestDTO> generateMockTest(@RequestBody CreateTestRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mockTestService.createTest(request));
    }

    @PostMapping("/grand-test/generate")
    public ResponseEntity<TestDTO> generateGrandTest(
            @RequestParam Long examId,
            @RequestParam(required = false) String title) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mockTestService.createGrandTest(examId, title));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<TestAttemptDTO> startTestAttempt(@PathVariable Long id, Authentication authentication) {
        User user = getUserFromAuth(authentication);
        return ResponseEntity.ok(mockTestService.startAttempt(id, user));
    }

    @PostMapping("/submit")
    public ResponseEntity<TestResultDTO> submitTestAttempt(@RequestBody SubmitTestDTO dto, Authentication authentication) {
        User user = getUserFromAuth(authentication);
        return ResponseEntity.ok(mockTestService.submitAttempt(dto, user));
    }

    @GetMapping("/attempts/{attemptId}/result")
    public ResponseEntity<TestResultDTO> getTestResult(@PathVariable Long attemptId, Authentication authentication) {
        User user = getUserFromAuth(authentication);
        return ResponseEntity.ok(mockTestService.getTestResult(attemptId, user));
    }

    @GetMapping("/my-attempts")
    public ResponseEntity<List<TestAttemptDTO>> getMyAttempts(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        return ResponseEntity.ok(mockTestService.getStudentAttempts(user));
    }

    private User getUserFromAuth(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalStateException("User authentication required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + authentication.getName()));
    }
}
