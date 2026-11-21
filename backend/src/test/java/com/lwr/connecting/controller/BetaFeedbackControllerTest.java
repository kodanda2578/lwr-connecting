package com.lwr.connecting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lwr.connecting.dto.BetaFeedbackDTO;
import com.lwr.connecting.entity.BetaFeedback;
import com.lwr.connecting.entity.Role;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.BetaFeedbackRepository;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:beta_feedback_test_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL"
})
class BetaFeedbackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private BetaFeedbackRepository betaFeedbackRepository;

    @MockBean
    private UserRepository userRepository;

    private String studentToken;
    private String adminToken;
    private User studentUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        Role studentRole = Role.builder().id(1).name("ROLE_STUDENT").build();
        Role adminRole = Role.builder().id(2).name("ROLE_ADMIN").build();

        studentUser = User.builder()
                .id(101L)
                .email("student.tester@lwrconnecting.com")
                .fullName("Aarav Student")
                .roles(Set.of(studentRole))
                .accountStatus("ACTIVE")
                .build();

        adminUser = User.builder()
                .id(999L)
                .email("admin@lwrconnecting.com")
                .fullName("Ramesh Admin")
                .roles(Set.of(adminRole))
                .accountStatus("ACTIVE")
                .build();

        when(userRepository.findByEmail("student.tester@lwrconnecting.com")).thenReturn(Optional.of(studentUser));
        when(userRepository.findByEmail("admin@lwrconnecting.com")).thenReturn(Optional.of(adminUser));

        studentToken = jwtTokenProvider.generateToken("student.tester@lwrconnecting.com", "ROLE_STUDENT");
        adminToken = jwtTokenProvider.generateToken("admin@lwrconnecting.com", "ROLE_ADMIN");
    }

    @Test
    void testSubmitFeedbackUnauthenticatedFails() throws Exception {
        BetaFeedbackDTO dto = BetaFeedbackDTO.builder()
                .overallRating(5)
                .overallExperience("Platform is super responsive and intuitive!")
                .build();

        mockMvc.perform(post("/api/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testSubmitFeedbackAsStudentSucceeds() throws Exception {
        BetaFeedbackDTO dto = BetaFeedbackDTO.builder()
                .overallRating(5)
                .overallExperience("Smooth experience preparing for EAPCET.")
                .difficultiesFaced("None observed")
                .collegeInfoIssues("GVPCE closing ranks need 2024 round 2 addition")
                .usefulFeatures("College Predictor and AI Assistant")
                .suggestions("Add more PYQs for Physics")
                .category("COLLEGE_DATA")
                .build();

        BetaFeedback savedFeedback = BetaFeedback.builder()
                .id(1L)
                .student(studentUser)
                .studentName("Aarav Student")
                .studentEmail("student.tester@lwrconnecting.com")
                .overallRating(5)
                .overallExperience("Smooth experience preparing for EAPCET.")
                .collegeInfoIssues("GVPCE closing ranks need 2024 round 2 addition")
                .usefulFeatures("College Predictor and AI Assistant")
                .suggestions("Add more PYQs for Physics")
                .category("COLLEGE_DATA")
                .status("NEW")
                .createdAt(LocalDateTime.now())
                .build();

        when(betaFeedbackRepository.save(any(BetaFeedback.class))).thenReturn(savedFeedback);

        mockMvc.perform(post("/api/feedback")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.studentName").value("Aarav Student"))
                .andExpect(jsonPath("$.overallRating").value(5))
                .andExpect(jsonPath("$.status").value("NEW"));
    }

    @Test
    void testAdminEndpointsProtectedFromStudents() throws Exception {
        mockMvc.perform(get("/api/admin/feedback")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/feedback/stats")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminCanFetchAndReviewFeedback() throws Exception {
        BetaFeedback item = BetaFeedback.builder()
                .id(10L)
                .student(studentUser)
                .studentName("Aarav Student")
                .studentEmail("student.tester@lwrconnecting.com")
                .overallRating(4)
                .overallExperience("Good mock test interface")
                .status("NEW")
                .category("MOCK_TEST")
                .createdAt(LocalDateTime.now())
                .build();

        when(betaFeedbackRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(item));
        when(betaFeedbackRepository.findById(10L)).thenReturn(Optional.of(item));
        when(betaFeedbackRepository.save(any(BetaFeedback.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(get("/api/admin/feedback")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10L))
                .andExpect(jsonPath("$[0].category").value("MOCK_TEST"));

        Map<String, String> patchBody = Map.of(
                "status", "IN_REVIEW",
                "adminNotes", "Verified feedback with test engine logs"
        );

        mockMvc.perform(patch("/api/admin/feedback/10")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patchBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_REVIEW"))
                .andExpect(jsonPath("$.adminNotes").value("Verified feedback with test engine logs"));
    }
}

