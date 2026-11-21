package com.lwr.connecting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lwr.connecting.entity.BetaAccessConfig;
import com.lwr.connecting.entity.Role;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.security.JwtTokenProvider;
import com.lwr.connecting.service.BetaAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:beta_access_test_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL"
})
public class BetaAccessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private BetaAccessService betaAccessService;

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
    public void testPublicBetaStatusEndpoint() throws Exception {
        Map<String, Object> status = new HashMap<>();
        status.put("betaActive", true);
        status.put("registrationLimit", 100);
        status.put("maxStudentsLimit", 100);
        status.put("currentBetaCount", 35);
        status.put("registeredStudents", 35);
        status.put("spotsRemaining", 65);
        status.put("remainingSpots", 65);
        status.put("registrationsOpen", true);
        status.put("registrationsPaused", false);

        when(betaAccessService.getBetaStatus()).thenReturn(status);

        mockMvc.perform(get("/api/beta/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.betaActive").value(true))
                .andExpect(jsonPath("$.registrationLimit").value(100))
                .andExpect(jsonPath("$.maxStudentsLimit").value(100))
                .andExpect(jsonPath("$.spotsRemaining").value(65))
                .andExpect(jsonPath("$.remainingSpots").value(65));
    }

    @Test
    public void testStudentRequestDataDeletion() throws Exception {
        when(betaAccessService.requestAccountDeletion(eq(101L), anyString(), eq("STUDENT"))).thenReturn(Map.of(
                "success", true,
                "userId", 101L,
                "status", "DELETION_PENDING"
        ));

        mockMvc.perform(post("/api/beta/request-deletion")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "Graduated class 12"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value("DELETION_PENDING"));
    }

    @Test
    public void testAdminEndpointsForbiddenForStudent() throws Exception {
        mockMvc.perform(get("/api/beta/admin/config")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/beta/admin/analytics")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAdminGetAndPatchBetaConfig() throws Exception {
        BetaAccessConfig config = BetaAccessConfig.builder()
                .id(1L)
                .registrationLimit(100)
                .registrationsPaused(false)
                .build();

        when(betaAccessService.getOrCreateConfig()).thenReturn(config);
        when(betaAccessService.updateBetaConfig(any(), anyString())).thenReturn(
                BetaAccessConfig.builder().id(1L).registrationLimit(150).registrationsPaused(true).build()
        );

        mockMvc.perform(get("/api/beta/admin/config")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrationLimit").value(100));

        mockMvc.perform(patch("/api/beta/admin/config")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("registrationLimit", 150, "registrationsPaused", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrationLimit").value(150))
                .andExpect(jsonPath("$.registrationsPaused").value(true));
    }

    @Test
    public void testAdminGetBetaAnalytics() throws Exception {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalRegisteredBetaStudents", 45);
        analytics.put("totalRegisteredStudents", 45);
        analytics.put("registrationLimit", 100);
        analytics.put("maxLimit", 100);
        analytics.put("activeStudents", 40);
        analytics.put("mockTestsAttempted", 80);
        analytics.put("collegeSearches", 120);
        analytics.put("predictorUsage", 95);
        analytics.put("feedbackSubmissions", 15);
        analytics.put("averageRating", 4.8);

        when(betaAccessService.getBetaAnalytics()).thenReturn(analytics);

        mockMvc.perform(get("/api/beta/admin/analytics")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRegisteredBetaStudents").value(45))
                .andExpect(jsonPath("$.totalRegisteredStudents").value(45))
                .andExpect(jsonPath("$.collegeSearches").value(120))
                .andExpect(jsonPath("$.predictorUsage").value(95))
                .andExpect(jsonPath("$.averageRating").value(4.8));
    }
}
