package com.lwr.connecting;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lwr.connecting.dto.BetaFeedbackDTO;
import com.lwr.connecting.entity.*;
import com.lwr.connecting.repository.*;
import com.lwr.connecting.security.JwtTokenProvider;
import com.lwr.connecting.service.BetaAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:beta_release_val_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "email.provider=LOG",
    "admin.seed.enabled=false"
})
public class BetaReleaseValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private BetaAccessConfigRepository betaAccessConfigRepository;

    @Autowired
    private BetaFeedbackRepository betaFeedbackRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private GuidanceRequestRepository guidanceRequestRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MentorRequestRepository mentorRequestRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private BetaAccessService betaAccessService;

    private Role studentRole;
    private Role adminRole;
    private User adminUser;
    private String adminToken;

    @BeforeEach
    void setUp() {
        messageRepository.deleteAll();
        betaFeedbackRepository.deleteAll();
        appointmentRepository.deleteAll();
        guidanceRequestRepository.deleteAll();
        mentorRequestRepository.deleteAll();
        otpVerificationRepository.deleteAll();
        userRepository.deleteAll();
        betaAccessConfigRepository.deleteAll();

        studentRole = roleRepository.findByName("ROLE_STUDENT")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_STUDENT").build()));
        adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

        adminUser = User.builder()
                .fullName("Ramesh Administrator")
                .email("admin@lwrconnecting.com")
                .passwordHash(passwordEncoder.encode("AdminPass123!"))
                .accountStatus("ACTIVE")
                .emailVerified(true)
                .roles(Set.of(adminRole))
                .build();
        adminUser = userRepository.save(adminUser);

        adminToken = jwtTokenProvider.generateToken("admin@lwrconnecting.com", "ROLE_ADMIN");

        // Ensure default beta config is present with inviteOnlyMode disabled for public regression tests
        BetaAccessConfig config = betaAccessService.getOrCreateConfig();
        config.setInviteOnlyMode(false);
        betaAccessConfigRepository.save(config);
    }

    // =========================================================================
    // PHASE 1: REGISTRATION TESTS
    // =========================================================================

    @Test
    @DisplayName("Phase 1.1: Registration with valid details succeeds and issues OTP step")
    void testRegistrationValidDetails() throws Exception {
        Map<String, String> payload = Map.of(
                "fullName", "Venkat Krishna",
                "email", "venkat.krishna@test.com",
                "mobileNumber", "9876543210",
                "password", "Pass1234!"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.nextStep").value("EMAIL_VERIFICATION"))
                .andExpect(jsonPath("$.email").value("venkat.krishna@test.com"));

        assertTrue(userRepository.existsByEmail("venkat.krishna@test.com"));
    }

    @Test
    @DisplayName("Phase 1.2: Duplicate registration with same email or mobile is prevented (409 Conflict)")
    void testDuplicateRegistrationPrevented() throws Exception {
        Map<String, String> payload1 = Map.of(
                "fullName", "Priya Sharma",
                "email", "priya.sharma@test.com",
                "mobileNumber", "9876543211",
                "password", "Pass1234!"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload1)))
                .andExpect(status().isCreated());

        // Duplicate Email attempt
        Map<String, String> payloadDuplicateEmail = Map.of(
                "fullName", "Priya S Duplicate",
                "email", "priya.sharma@test.com",
                "mobileNumber", "9876543299",
                "password", "OtherPass1!"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadDuplicateEmail)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", containsString("already registered")));

        // Duplicate Mobile attempt
        Map<String, String> payloadDuplicateMobile = Map.of(
                "fullName", "Another Student",
                "email", "another.student@test.com",
                "mobileNumber", "9876543211",
                "password", "OtherPass1!"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadDuplicateMobile)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", containsString("Mobile number is already registered")));
    }

    @Test
    @DisplayName("Phase 1.3: Registration when paused is rejected (403 Forbidden)")
    void testRegistrationWhilePaused() throws Exception {
        // Admin pauses registrations
        betaAccessService.updateBetaConfig(Map.of("registrationsPaused", true), "admin@lwrconnecting.com");

        Map<String, String> payload = Map.of(
                "fullName", "Paused Test Student",
                "email", "paused.student@test.com",
                "mobileNumber", "9876543212",
                "password", "Pass1234!"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("temporarily paused")));

        // Admin resumes registrations
        betaAccessService.updateBetaConfig(Map.of("registrationsPaused", false), "admin@lwrconnecting.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Phase 1.4: Registration at capacity (100/100) is rejected (403 Forbidden)")
    void testRegistrationAtCapacity() throws Exception {
        // Set registration limit to 2 for this test
        betaAccessService.updateBetaConfig(Map.of("registrationLimit", 2), "admin@lwrconnecting.com");

        // Register 1st student (1/2)
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "Student One",
                                "email", "student1@test.com",
                                "mobileNumber", "9100000001",
                                "password", "Pass1234!"
                        ))))
                .andExpect(status().isCreated());

        // Register 2nd student (2/2) -> At capacity
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "Student Two",
                                "email", "student2@test.com",
                                "mobileNumber", "9100000002",
                                "password", "Pass1234!"
                        ))))
                .andExpect(status().isCreated());

        // Attempt 3rd student -> Capacity reached
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "Student Three",
                                "email", "student3@test.com",
                                "mobileNumber", "9100000003",
                                "password", "Pass1234!"
                        ))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("reached its capacity")));
    }

    @Test
    @DisplayName("Phase 1.5: Simultaneous concurrent registration requests near capacity cannot bypass limit")
    void testConcurrentRegistrationsCannotBypassCapacity() throws Exception {
        // Set limit to 5
        betaAccessService.updateBetaConfig(Map.of("registrationLimit", 5), "admin@lwrconnecting.com");

        // Seed 4 students already in database (4/5)
        for (int i = 1; i <= 4; i++) {
            User u = User.builder()
                    .fullName("Preseeded Student " + i)
                    .email("seeded" + i + "@test.com")
                    .mobileNumber("920000000" + i)
                    .passwordHash("hash")
                    .accountStatus("ACTIVE")
                    .roles(Set.of(studentRole))
                    .build();
            userRepository.save(u);
        }

        assertEquals(4, userRepository.countByRoles_Name("ROLE_STUDENT"));

        // Now run 10 simultaneous threads competing for the single 5th spot
        int numThreads = 10;
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);

        for (int i = 1; i <= numThreads; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    Map<String, String> payload = Map.of(
                            "fullName", "Concurrent Student " + index,
                            "email", "concurrent" + index + "@test.com",
                            "mobileNumber", "93000000" + (index < 10 ? "0" + index : index),
                            "password", "Pass1234!"
                    );

                    MvcResult result = mockMvc.perform(post("/api/auth/register")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(payload)))
                            .andReturn();

                    int status = result.getResponse().getStatus();
                    if (status == 201) {
                        successCount.incrementAndGet();
                    } else if (status == 403) {
                        rejectedCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    // unexpected error
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // Release all threads at once
        assertTrue(doneLatch.await(10, TimeUnit.SECONDS));
        executor.shutdown();

        // Exactly 1 thread must have secured the 5th spot; exactly 9 rejected
        assertEquals(1, successCount.get(), "Exactly one concurrent thread should obtain the final beta slot");
        assertEquals(9, rejectedCount.get(), "Nine concurrent threads should be rejected with 403 Forbidden");

        long totalStudentCount = userRepository.countByRoles_Name("ROLE_STUDENT");
        assertEquals(5, totalStudentCount, "Total student count must strictly not exceed the beta limit of 5");
    }

    // =========================================================================
    // PHASE 2: MINOR SAFETY & GUARDIAN CONSENT TESTS
    // =========================================================================

    @Test
    @DisplayName("Phase 2.1: Under-18 registration requires guardian consent and audit timestamp")
    void testUnder18RegistrationWithConsent() throws Exception {
        User student = User.builder()
                .fullName("Minor Student")
                .email("minor.student@test.com")
                .mobileNumber("9400000001")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .accountStatus("PENDING_VERIFICATION")
                .roles(Set.of(studentRole))
                .build();
        student = userRepository.save(student);

        // Missing consent attempt -> Rejected (400 Bad Request)
        Map<String, Object> missingConsentPayload = Map.of(
                "userId", student.getId(),
                "intermediateClass", 11,
                "studyStream", "MPC",
                "targetExam", "AP_EAPCET",
                "state", "Andhra Pradesh",
                "isMinor", true,
                "guardianConsentGiven", false
        );

        mockMvc.perform(post("/api/auth/complete-profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(missingConsentPayload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("consent is mandatory for students under 18")));

        // Valid guardian consent provided
        Map<String, Object> validConsentPayload = Map.of(
                "userId", student.getId(),
                "intermediateClass", 11,
                "studyStream", "MPC",
                "targetExam", "AP_EAPCET",
                "state", "Andhra Pradesh",
                "isMinor", true,
                "guardianName", "S. Venkat Rao",
                "guardianPhone", "9876543299",
                "guardianEmail", "guardian@family.com",
                "guardianConsentGiven", true
        );

        mockMvc.perform(post("/api/auth/complete-profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validConsentPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountStatus").value("ACTIVE"));

        // Audit check in DB
        User updatedStudent = userRepository.findById(student.getId()).orElseThrow();
        StudentProfile p = updatedStudent.getProfile();
        assertNotNull(p);
        assertTrue(p.getIsMinor());
        assertTrue(p.getGuardianConsentGiven());
        assertNotNull(p.getGuardianConsentTimestamp(), "Guardian consent timestamp must be recorded for auditing");
        assertEquals("S. Venkat Rao", p.getGuardianName());
    }

    @Test
    @DisplayName("Phase 2.2: 18-or-older registration succeeds without guardian consent")
    void testAdultRegistrationDoesNotRequireGuardianConsent() throws Exception {
        User adultStudent = User.builder()
                .fullName("Adult Student")
                .email("adult.student@test.com")
                .mobileNumber("9400000002")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .accountStatus("PENDING_VERIFICATION")
                .roles(Set.of(studentRole))
                .build();
        adultStudent = userRepository.save(adultStudent);

        Map<String, Object> adultPayload = Map.of(
                "userId", adultStudent.getId(),
                "intermediateClass", 12,
                "studyStream", "MPC",
                "targetExam", "JEE_MAIN",
                "state", "Telangana",
                "isMinor", false
        );

        mockMvc.perform(post("/api/auth/complete-profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adultPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountStatus").value("ACTIVE"));

        User checked = userRepository.findById(adultStudent.getId()).orElseThrow();
        assertFalse(checked.getProfile().getIsMinor());
    }

    @Test
    @DisplayName("Phase 2.3: Minor without guardian consent cannot initiate mentorship or private messaging")
    void testMinorWithoutConsentMentorshipRestrictions() throws Exception {
        // Minor who bypassed or has false consent
        User unconsentedMinor = User.builder()
                .fullName("Unconsented Minor")
                .email("unconsented@test.com")
                .mobileNumber("9400000003")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .accountStatus("ACTIVE")
                .roles(Set.of(studentRole))
                .build();
        unconsentedMinor = userRepository.save(unconsentedMinor);

        StudentProfile prof = StudentProfile.builder()
                .user(unconsentedMinor)
                .isMinor(true)
                .guardianConsentGiven(false)
                .build();
        unconsentedMinor.setProfile(prof);
        userRepository.save(unconsentedMinor);

        String minorToken = jwtTokenProvider.generateToken("unconsented@test.com", "ROLE_STUDENT");

        // Mentorship request attempt -> 403 Forbidden
        mockMvc.perform(post("/api/guidance-requests")
                        .header("Authorization", "Bearer " + minorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("message", "Need private mentor session"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("Parent/Guardian consent is required")));

        // Direct message attempt -> 403 Forbidden
        mockMvc.perform(post("/api/messages")
                        .header("Authorization", "Bearer " + minorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("messageText", "Hello mentor"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("Guardian consent is required")));
    }

    @Test
    @DisplayName("Phase 2.4: Student direct messages are strictly locked to platform admin, never random users")
    void testStudentMessagingRestrictedToAdminOnly() throws Exception {
        User verifiedMinor = User.builder()
                .fullName("Verified Student")
                .email("verified@test.com")
                .mobileNumber("9400000004")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .accountStatus("ACTIVE")
                .roles(Set.of(studentRole))
                .build();
        verifiedMinor = userRepository.save(verifiedMinor);

        StudentProfile prof = StudentProfile.builder()
                .user(verifiedMinor)
                .isMinor(true)
                .guardianConsentGiven(true)
                .guardianConsentTimestamp(LocalDateTime.now())
                .build();
        verifiedMinor.setProfile(prof);
        userRepository.save(verifiedMinor);

        // Third-party student user
        User thirdParty = User.builder()
                .fullName("Third Party Student")
                .email("thirdparty@test.com")
                .mobileNumber("9400000099")
                .passwordHash("pass")
                .roles(Set.of(studentRole))
                .build();
        thirdParty = userRepository.save(thirdParty);

        String token = jwtTokenProvider.generateToken("verified@test.com", "ROLE_STUDENT");

        // Attempting to message thirdParty by sending receiverId in payload
        mockMvc.perform(post("/api/messages")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "messageText", "Trying to talk to peer",
                                "studentId", thirdParty.getId().toString()
                        ))))
                .andExpect(status().isCreated());

        // Verify in DB that message recipient was overridden to Ramesh Admin, NOT third party
        List<Message> messages = messageRepository.findAll();
        assertEquals(1, messages.size());
        assertEquals(adminUser.getId(), messages.get(0).getReceiver().getId(),
                "Student message receiver must be forced to verified platform admin");
        assertNotEquals(thirdParty.getId(), messages.get(0).getReceiver().getId());
    }

    // =========================================================================
    // PHASE 3: FEEDBACK SYSTEM TESTS
    // =========================================================================

    @Test
    @DisplayName("Phase 3.1: Student feedback submission with ratings, bug severity and deduplication")
    void testStudentFeedbackSubmissionAndDeduplication() throws Exception {
        User student = User.builder()
                .fullName("Feedback Student")
                .email("fb.student@test.com")
                .passwordHash("pass")
                .accountStatus("ACTIVE")
                .roles(Set.of(studentRole))
                .build();
        student = userRepository.save(student);

        String token = jwtTokenProvider.generateToken("fb.student@test.com", "ROLE_STUDENT");

        BetaFeedbackDTO dto = BetaFeedbackDTO.builder()
                .overallRating(5)
                .mockTestsRating(4)
                .predictorRating(5)
                .cutoffsRating(4)
                .aiGuidanceRating(5)
                .mentorshipRating(5)
                .category("BUG")
                .bugSeverity("HIGH")
                .overallExperience("Very fast platform for AP EAPCET cutoffs.")
                .difficultiesFaced("Cutoff chart slightly overflows on mobile screen.")
                .suggestions("Add subject-wise marks calculator.")
                .build();

        // 1. First submission succeeds (201 Created)
        mockMvc.perform(post("/api/feedback")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.overallRating").value(5))
                .andExpect(jsonPath("$.bugSeverity").value("HIGH"))
                .andExpect(jsonPath("$.status").value("NEW"));

        assertEquals(1, betaFeedbackRepository.count());

        // 2. Immediate accidental double submission within 15 seconds returns deduplicated entry
        mockMvc.perform(post("/api/feedback")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk()); // Deduplicated, returns existing 200 OK

        assertEquals(1, betaFeedbackRepository.count(), "Accidental double submission must be deduplicated");
    }

    @Test
    @DisplayName("Phase 3.2: Admin feedback management, status transitions, and resolution notes")
    void testAdminFeedbackStatusTransitions() throws Exception {
        User student = User.builder()
                .fullName("Tester Student")
                .email("tester@test.com")
                .passwordHash("pass")
                .accountStatus("ACTIVE")
                .roles(Set.of(studentRole))
                .build();
        student = userRepository.save(student);

        BetaFeedback feedback = BetaFeedback.builder()
                .student(student)
                .studentName(student.getFullName())
                .studentEmail(student.getEmail())
                .overallRating(4)
                .category("BUG")
                .bugSeverity("CRITICAL")
                .overallExperience("Mock test timer froze during Question 15.")
                .status("NEW")
                .createdAt(LocalDateTime.now())
                .build();
        feedback = betaFeedbackRepository.save(feedback);

        // 1. Admin reads feedback
        mockMvc.perform(get("/api/admin/feedback")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status").value("NEW"));

        // 2. Transition NEW -> IN_PROGRESS
        mockMvc.perform(patch("/api/admin/feedback/" + feedback.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "status", "IN_PROGRESS",
                                "adminNotes", "Investigating frontend timer state handler"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.adminNotes", containsString("Investigating")));

        // 3. Transition IN_PROGRESS -> RESOLVED
        mockMvc.perform(patch("/api/admin/feedback/" + feedback.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "status", "RESOLVED",
                                "adminNotes", "Fixed WebWorker heartbeat for timer stability."
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));

        // 4. Verify student can read admin's resolution notes on /api/feedback/my
        String studentToken = jwtTokenProvider.generateToken("tester@test.com", "ROLE_STUDENT");
        mockMvc.perform(get("/api/feedback/my")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("RESOLVED"))
                .andExpect(jsonPath("$[0].adminNotes", containsString("Fixed WebWorker heartbeat")));
    }

    @Test
    @DisplayName("Phase 3.3: Unauthorized student cannot access admin feedback dashboard (403 Forbidden)")
    void testUnauthorizedAdminFeedbackAccess() throws Exception {
        User student = User.builder()
                .fullName("Sneaky Student")
                .email("sneaky@test.com")
                .passwordHash("pass")
                .accountStatus("ACTIVE")
                .roles(Set.of(studentRole))
                .build();
        student = userRepository.save(student);

        String studentToken = jwtTokenProvider.generateToken("sneaky@test.com", "ROLE_STUDENT");

        mockMvc.perform(get("/api/admin/feedback")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // PHASE 4: ANALYTICS VERIFICATION TESTS
    // =========================================================================

    @Test
    @DisplayName("Phase 4.1: Aggregated beta analytics correctly counts metrics without exposing student PII")
    void testAggregatedBetaAnalyticsPrivacy() throws Exception {
        // Register 2 students
        User s1 = User.builder().fullName("Student Secret One").email("s1@secret.com").passwordHash("p").accountStatus("ACTIVE").roles(Set.of(studentRole)).build();
        User s2 = User.builder().fullName("Student Secret Two").email("s2@secret.com").passwordHash("p").accountStatus("ACTIVE").roles(Set.of(studentRole)).build();
        userRepository.saveAll(List.of(s1, s2));

        // Record some college searches and predictor usages
        betaAccessService.recordCollegeSearch();
        betaAccessService.recordCollegeSearch();
        betaAccessService.recordPredictorUsage();

        // Submit a feedback
        BetaFeedback fb = BetaFeedback.builder()
                .student(s1)
                .studentName(s1.getFullName())
                .studentEmail(s1.getEmail())
                .overallRating(5)
                .category("GENERAL")
                .overallExperience("Great UI")
                .status("NEW")
                .build();
        betaFeedbackRepository.save(fb);

        MvcResult result = mockMvc.perform(get("/api/beta/admin/analytics")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRegisteredStudents").value(2))
                .andExpect(jsonPath("$.activeStudents").value(2))
                .andExpect(jsonPath("$.collegeSearches").value(2))
                .andExpect(jsonPath("$.predictorUsage").value(1))
                .andExpect(jsonPath("$.feedbackSubmissions").value(1))
                .andExpect(jsonPath("$.averageRating").value(5.0))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();

        // SECURITY CHECK: Ensure student PII is not leaked in analytics
        assertFalse(responseBody.contains("Student Secret One"), "Analytics must never expose student name");
        assertFalse(responseBody.contains("s1@secret.com"), "Analytics must never expose student email");
        assertFalse(responseBody.contains("password"), "Analytics must never expose credentials");
    }

    // =========================================================================
    // PHASE 5: PRIVACY & DELETION TESTS
    // =========================================================================

    @Test
    @DisplayName("Phase 5.1: Student account deletion request marks status as DELETION_PENDING")
    void testStudentAccountDeletionWorkflow() throws Exception {
        User student = User.builder()
                .fullName("Graduating Student")
                .email("graduating@test.com")
                .mobileNumber("9500000001")
                .passwordHash("pass")
                .accountStatus("ACTIVE")
                .roles(Set.of(studentRole))
                .build();
        student = userRepository.save(student);

        StudentProfile prof = StudentProfile.builder()
                .user(student)
                .isMinor(true)
                .guardianName("Guardian Name")
                .guardianConsentGiven(true)
                .build();
        student.setProfile(prof);
        userRepository.save(student);

        String token = jwtTokenProvider.generateToken("graduating@test.com", "ROLE_STUDENT");

        // 1. Submit deletion request
        mockMvc.perform(post("/api/beta/request-deletion")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "reason", "Admitted to engineering college, please delete profile"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value("DELETION_PENDING"));

        // Verify DB status
        User checked = userRepository.findById(student.getId()).orElseThrow();
        assertEquals("DELETION_PENDING", checked.getAccountStatus());
        assertTrue(checked.getProfile().getDeletionRequested());
        assertNotNull(checked.getProfile().getDeletionRequestedAt());

        // 2. Admin reviews pending deletion requests
        mockMvc.perform(get("/api/beta/admin/deletion-requests")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].email").value("graduating@test.com"))
                .andExpect(jsonPath("$[0].accountStatus").value("DELETION_PENDING"));

        // 3. Admin processes deletion (Anonymizes PII, sets DELETED)
        mockMvc.perform(post("/api/beta/admin/deletion-requests/" + student.getId() + "/process")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("notes", "Verified guardian consent to delete"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELETED"));

        // Verify PII is expunged
        User deletedUser = userRepository.findById(student.getId()).orElseThrow();
        assertEquals("DELETED", deletedUser.getAccountStatus());
        assertNull(deletedUser.getMobileNumber(), "Mobile number must be expunged");
        assertEquals("EXPUNGED", deletedUser.getProfile().getGuardianName(), "Guardian name must be expunged");
        assertTrue(deletedUser.getEmail().startsWith("deleted_"), "Email must be anonymized");
    }

    @Test
    @DisplayName("Phase 5.2: Unauthenticated user cannot request deletion (4xx Forbidden/Unauthorized)")
    void testUnauthenticatedDeletionRequestRejected() throws Exception {
        mockMvc.perform(post("/api/beta/request-deletion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "Malicious attempt"))))
                .andExpect(status().is4xxClientError());
    }
}
