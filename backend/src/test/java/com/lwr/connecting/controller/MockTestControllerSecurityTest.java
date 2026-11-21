package com.lwr.connecting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lwr.connecting.dto.CreateTestRequestDTO;
import com.lwr.connecting.dto.TestAttemptDTO;
import com.lwr.connecting.dto.TestDTO;
import com.lwr.connecting.entity.Role;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.enums.AttemptStatus;
import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.enums.TestType;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.security.JwtTokenProvider;
import com.lwr.connecting.service.MockTestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:mocktest_sec_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL"
})
class MockTestControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private MockTestService mockTestService;

    @MockBean
    private UserRepository userRepository;

    private String studentJwt;
    private User studentUser;

    @BeforeEach
    void setUp() {
        Role studentRole = Role.builder().id(1).name("ROLE_STUDENT").build();
        studentUser = User.builder()
                .id(999L)
                .email("student.tester@lwrconnecting.com")
                .passwordHash("$2a$10$abcdefghijklmnopqrstuvwxyz1234567890")
                .fullName("Student Tester")
                .accountStatus("ACTIVE")
                .emailVerified(true)
                .mobileVerified(true)
                .roles(Set.of(studentRole))
                .build();

        when(userRepository.findByEmail("student.tester@lwrconnecting.com")).thenReturn(Optional.of(studentUser));
        studentJwt = jwtTokenProvider.generateToken("student.tester@lwrconnecting.com", "ROLE_STUDENT");
    }

    @Test
    void testGenerateMockTestWithoutAuthReturnsForbidden() throws Exception {
        CreateTestRequestDTO req = new CreateTestRequestDTO();
        req.setExamId(1L);
        req.setTestType(TestType.TOPIC_MOCK);
        req.setTotalQuestions(10);
        req.setDifficulty(Difficulty.MEDIUM);

        mockMvc.perform(post("/api/mock-tests/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGenerateMockTestWithStudentJwtSucceeds() throws Exception {
        CreateTestRequestDTO req = new CreateTestRequestDTO();
        req.setExamId(1L);
        req.setTestType(TestType.TOPIC_MOCK);
        req.setTotalQuestions(10);
        req.setDifficulty(Difficulty.MEDIUM);

        TestDTO mockResult = TestDTO.builder()
                .id(42L)
                .title("JEE Main Dynamic Test")
                .totalQuestions(10)
                .build();

        when(mockTestService.createTest(any(CreateTestRequestDTO.class))).thenReturn(mockResult);

        mockMvc.perform(post("/api/mock-tests/generate")
                        .header("Authorization", "Bearer " + studentJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.title").value("JEE Main Dynamic Test"));
    }

    @Test
    void testGetMyAttemptsWithoutAuthReturnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/mock-tests/my-attempts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void testGetMyAttemptsWithStudentJwtReturnsAttempts() throws Exception {
        TestAttemptDTO attempt = TestAttemptDTO.builder()
                .id(101L)
                .score(80)
                .status(AttemptStatus.SUBMITTED)
                .build();

        when(mockTestService.getStudentAttempts(any(User.class)))
                .thenReturn(Collections.singletonList(attempt));

        mockMvc.perform(get("/api/mock-tests/my-attempts")
                        .header("Authorization", "Bearer " + studentJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(101))
                .andExpect(jsonPath("$[0].score").value(80));
    }
}
