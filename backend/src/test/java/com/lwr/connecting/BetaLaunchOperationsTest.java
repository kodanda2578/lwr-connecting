package com.lwr.connecting;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lwr.connecting.entity.BetaAccessConfig;
import com.lwr.connecting.entity.Role;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.BetaAccessConfigRepository;
import com.lwr.connecting.repository.RoleRepository;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.security.JwtTokenProvider;
import com.lwr.connecting.service.BetaAccessService;
import com.lwr.connecting.service.DatabaseBackupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class BetaLaunchOperationsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BetaAccessService betaAccessService;

    @Autowired
    private DatabaseBackupService databaseBackupService;

    @Autowired
    private BetaAccessConfigRepository betaAccessConfigRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    void setUp() {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

        if (!userRepository.existsByEmail("admin_ops@lwrconnecting.com")) {
            User admin = User.builder()
                    .fullName("Ops Admin")
                    .email("admin_ops@lwrconnecting.com")
                    .mobileNumber("9988776655")
                    .passwordHash(passwordEncoder.encode("AdminPass123!"))
                    .emailVerified(true)
                    .mobileVerified(true)
                    .accountStatus("ACTIVE")
                    .roles(Collections.singleton(adminRole))
                    .build();
            userRepository.save(admin);
        }

        adminToken = jwtTokenProvider.generateToken("admin_ops@lwrconnecting.com", "ROLE_ADMIN");

        BetaAccessConfig config = betaAccessService.getOrCreateConfig();
        config.setRegistrationLimit(50);
        config.setRegistrationsPaused(false);
        betaAccessConfigRepository.save(config);
    }

    @Test
    @DisplayName("Configuration Health Check returns complete subsystem status without exposing secrets")
    void testConfigurationHealthCheckNoSecrets() throws Exception {
        String resp = mockMvc.perform(get("/api/beta/admin/health")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database.status").value("UP"))
                .andExpect(jsonPath("$.email.provider").exists())
                .andExpect(jsonPath("$.ai.status").exists())
                .andExpect(jsonPath("$.security.jwtConfigured").value(true))
                .andExpect(jsonPath("$.security.rawOtpLoggingDisabled").value(true))
                .andExpect(jsonPath("$.beta.registrationLimit").value(50))
                .andReturn().getResponse().getContentAsString();

        // Strictly verify raw secrets are NOT present
        assertFalse(resp.contains("gasw dsui"), "Health check must not expose raw SMTP password!");
        assertFalse(resp.contains("super_secret_jwt"), "Health check must not expose JWT secret!");
        assertFalse(resp.contains("Admin@LWR2026!"), "Health check must not expose admin password!");
    }

    @Test
    @DisplayName("Database backup creation, listing, and isolated restoration verification")
    void testDatabaseBackupAndIsolatedVerification() {
        // 1. Create live consistent backup
        Map<String, Object> createResult = databaseBackupService.createBackup();
        assertTrue((Boolean) createResult.get("success"), "Backup creation should succeed");
        String fileName = (String) createResult.get("fileName");
        assertNotNull(fileName, "File name must not be null");

        // 2. List backups
        List<Map<String, Object>> backups = databaseBackupService.listBackups();
        assertFalse(backups.isEmpty(), "Backup list should contain at least 1 backup");
        boolean found = backups.stream().anyMatch(b -> fileName.equals(b.get("fileName")));
        assertTrue(found, "Created backup should appear in list");

        // 3. Isolated Restore Verification
        Map<String, Object> verifyResult = databaseBackupService.verifyBackup(fileName);
        assertTrue((Boolean) verifyResult.get("verified"), "Restore verification on isolated test db should succeed");
        @SuppressWarnings("unchecked")
        Map<String, Long> counts = (Map<String, Long>) verifyResult.get("tableCounts");
        assertNotNull(counts, "Table counts must be returned");
        assertTrue(counts.get("users") >= 0, "Users table count must be >= 0");
    }

    @Test
    @DisplayName("Launch overview returns aggregated monitoring metrics")
    void testLaunchOverviewMetrics() throws Exception {
        mockMvc.perform(get("/api/beta/admin/launch-overview")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successfulRegistrations").exists())
                .andExpect(jsonPath("$.failedRegistrations").exists())
                .andExpect(jsonPath("$.firstWaveTarget").value(50))
                .andExpect(jsonPath("$.registrationLimit").value(50))
                .andExpect(jsonPath("$.remainingSpots").exists())
                .andExpect(jsonPath("$.activeStudents").exists())
                .andExpect(jsonPath("$.feedbackSubmissions").exists())
                .andExpect(jsonPath("$.criticalBugs").exists())
                .andExpect(jsonPath("$.openBugs").exists());
    }

    @Test
    @DisplayName("Gemini API Ping reports live connectivity or autonomous LWR Knowledge Engine active")
    void testGeminiPingOrKnowledgeEngine() throws Exception {
        mockMvc.perform(post("/api/beta/admin/health/test-gemini")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider").value("GEMINI"))
                .andExpect(jsonPath("$.activeEngine").exists())
                .andExpect(jsonPath("$.status").exists());
    }

    @Test
    @DisplayName("Failed registration attempts increment counter in launch monitoring")
    void testFailedRegistrationIncrementsCounter() throws Exception {
        long initialFailed = (Long) betaAccessService.getLaunchOverview().get("failedRegistrations");

        // Trigger invalid registration (missing name/password)
        Map<String, String> invalidReq = Map.of("email", "bad_test_" + System.currentTimeMillis() + "@test.com");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest());

        long afterFailed = (Long) betaAccessService.getLaunchOverview().get("failedRegistrations");
        assertEquals(initialFailed + 1, afterFailed, "Failed registration counter should have incremented");
    }
}
