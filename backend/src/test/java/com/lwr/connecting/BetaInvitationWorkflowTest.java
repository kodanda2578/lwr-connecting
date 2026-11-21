package com.lwr.connecting;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lwr.connecting.entity.BetaAccessConfig;
import com.lwr.connecting.entity.BetaInvitation;
import com.lwr.connecting.entity.Role;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.BetaAccessConfigRepository;
import com.lwr.connecting.repository.BetaInvitationRepository;
import com.lwr.connecting.repository.RoleRepository;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.security.JwtTokenProvider;
import com.lwr.connecting.service.BetaAccessService;
import com.lwr.connecting.service.BetaInvitationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.TestPropertySource(properties = {"email.provider=LOG"})
public class BetaInvitationWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BetaInvitationService betaInvitationService;

    @Autowired
    private BetaAccessService betaAccessService;

    @Autowired
    private BetaInvitationRepository betaInvitationRepository;

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

        if (!userRepository.existsByEmail("admin_invite_test@lwrconnecting.com")) {
            User admin = User.builder()
                    .fullName("Admin Inviter")
                    .email("admin_invite_test@lwrconnecting.com")
                    .mobileNumber("9876543299")
                    .passwordHash(passwordEncoder.encode("AdminPass123!"))
                    .emailVerified(true)
                    .mobileVerified(true)
                    .accountStatus("ACTIVE")
                    .roles(Collections.singleton(adminRole))
                    .build();
            userRepository.save(admin);
        }

        adminToken = jwtTokenProvider.generateToken("admin_invite_test@lwrconnecting.com", "ROLE_ADMIN");

        BetaAccessConfig config = betaAccessService.getOrCreateConfig();
        config.setRegistrationLimit(50);
        config.setRegistrationsPaused(false);
        config.setInviteOnlyMode(true);
        betaAccessConfigRepository.save(config);
    }

    @Test
    @DisplayName("Admin can create single and batch invitation codes and retrieve statistics")
    void testInvitationGenerationAndStats() {
        BetaInvitation single = betaInvitationService.createInvitation("Kavya Student", "kavya_test@example.com", "WHATSAPP", "Class 12 MPC", 14, "admin");
        assertNotNull(single.getCode(), "Invitation code must be generated");
        assertTrue(single.getCode().startsWith("LWR-W1-"), "Code should follow LWR-W1- prefix format");
        assertEquals("PENDING", single.getStatus());

        List<BetaInvitation> batch = betaInvitationService.batchGenerateInvitations(5, "COLLEGE_NETWORK", 14, "Narayana Junior College batch", "admin");
        assertEquals(5, batch.size(), "Batch should generate 5 invitation codes");

        Map<String, Object> stats = betaInvitationService.getInvitationStats();
        assertTrue((Long) stats.get("totalIssued") >= 6);
        assertTrue((Long) stats.get("pending") >= 6);
        assertEquals(50, stats.get("registrationLimit"));
        assertTrue((Boolean) stats.get("inviteOnlyMode"));
    }

    @Test
    @DisplayName("Registration requires invitation code in invite-only mode and rejects public registration")
    void testInviteOnlyModeRejectsPublicRegistration() throws Exception {
        Map<String, String> publicReq = new HashMap<>();
        publicReq.put("fullName", "Public Aspirant");
        publicReq.put("email", "public_aspirant_" + System.currentTimeMillis() + "@example.com");
        publicReq.put("password", "Pass1234!");

        // Missing inviteCode in invite-only mode -> HTTP 403 Forbidden
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(publicReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Registration is currently invite-only for Wave 1. A valid invitation code is required to register."));
    }

    @Test
    @DisplayName("Student registration with valid invitation code succeeds and redeems the code")
    void testSuccessfulRegistrationAndRedemption() throws Exception {
        BetaInvitation inv = betaInvitationService.createInvitation("Srikar", null, "COLLEGE_NETWORK", "Referred by senior", 14, "admin");

        String studentEmail = "srikar_invite_" + System.currentTimeMillis() + "@example.com";
        Map<String, String> validReq = new HashMap<>();
        validReq.put("fullName", "Srikar V");
        validReq.put("email", studentEmail);
        validReq.put("password", "SecurePass123!");
        validReq.put("inviteCode", inv.getCode());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.nextStep").value("EMAIL_VERIFICATION"));

        // Verify code is now ACCEPTED and redeemed
        BetaInvitation updated = betaInvitationRepository.findByCodeIgnoreCase(inv.getCode()).orElseThrow();
        assertEquals("ACCEPTED", updated.getStatus(), "Invitation should be marked ACCEPTED upon registration");
        assertNotNull(updated.getAcceptedByUserId(), "Redeemed student userId must be tracked");
        assertEquals(studentEmail, updated.getAcceptedByEmail());

        // Attempting to register second student with same code -> HTTP 400 Bad Request
        Map<String, String> repeatReq = new HashMap<>();
        repeatReq.put("fullName", "Duplicate Srikar");
        repeatReq.put("email", "dup_srikar_" + System.currentTimeMillis() + "@example.com");
        repeatReq.put("password", "SecurePass123!");
        repeatReq.put("inviteCode", inv.getCode());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(repeatReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("This invitation code has already been used."));
    }

    @Test
    @DisplayName("Registration rejects revoked or expired invitation codes")
    void testRevokedOrExpiredInvitationRejected() throws Exception {
        BetaInvitation inv = betaInvitationService.createInvitation("Revoke Candidate", null, "WHATSAPP", "Revoke test", 14, "admin");
        betaInvitationService.revokeInvitation(inv.getId(), "admin");

        Map<String, String> req = new HashMap<>();
        req.put("fullName", "Revoked Candidate");
        req.put("email", "revoked_student_" + System.currentTimeMillis() + "@example.com");
        req.put("password", "SecurePass123!");
        req.put("inviteCode", inv.getCode());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("This invitation code has been revoked by platform administrators."));
    }

    @Test
    @DisplayName("Public code validation endpoint returns accurate status for student UI")
    void testPublicCodeValidationEndpoint() throws Exception {
        BetaInvitation inv = betaInvitationService.createInvitation("Test Validation", null, "INSTAGRAM_YOUTUBE", "Insta DM", 14, "admin");

        mockMvc.perform(get("/api/beta/validate-invite")
                .param("code", inv.getCode()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.code").value(inv.getCode()))
                .andExpect(jsonPath("$.channel").value("INSTAGRAM_YOUTUBE"));

        mockMvc.perform(get("/api/beta/validate-invite")
                .param("code", "LWR-INVALID-NONEXISTENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.reason").value("Invalid invitation code. Please check for typos."));
    }
}

