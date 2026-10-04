package com.lwr.connecting.controller;

import com.lwr.connecting.dto.AuthResponse;
import com.lwr.connecting.dto.LoginRequest;
import com.lwr.connecting.entity.OtpVerification;
import com.lwr.connecting.entity.Role;
import com.lwr.connecting.entity.StudentProfile;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.OtpVerificationRepository;
import com.lwr.connecting.repository.RoleRepository;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.security.JwtTokenProvider;
import com.lwr.connecting.service.EmailService;
import com.lwr.connecting.service.SmsService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private EmailService emailService;

    private final SecureRandom random = new SecureRandom();

    private String generate6DigitOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + domain;
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + "@" + domain;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            if (loginRequest == null || loginRequest.getEmail() == null || loginRequest.getEmail().isBlank()
                    || loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Email and password are required.");
                return ResponseEntity.badRequest().body(err);
            }

            String email = loginRequest.getEmail().trim();
            String password = loginRequest.getPassword();

            Authentication authentication;
            try {
                authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(email, password)
                );
            } catch (AuthenticationException e) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Invalid email or password. Please try again.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
            }

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Invalid email or password. Please try again.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
            }

            String role = user.getRoles().stream().findFirst().map(Role::getName).orElse("ROLE_STUDENT");

            // Direct JWT issue for ADMIN role (separate authentication)
            if ("ROLE_ADMIN".equals(role)) {
                String jwt = tokenProvider.generateToken(user.getEmail(), role);
                return ResponseEntity.ok(AuthResponse.builder()
                        .token(jwt)
                        .userId(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(role)
                        .build());
            }

            // Student Onboarding Verification Check
            if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", false);
                resp.put("code", "EMAIL_VERIFICATION_REQUIRED");
                resp.put("nextStep", "EMAIL_VERIFICATION");
                resp.put("userId", user.getId());
                resp.put("email", user.getEmail());
                resp.put("mobileNumber", user.getMobileNumber());
                resp.put("message", "Email verification required before accessing the platform.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(resp);
            }

            if (user.getProfile() == null || !Boolean.TRUE.equals(user.getProfile().getProfileCompleted())) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", false);
                resp.put("code", "PROFILE_COMPLETION_REQUIRED");
                resp.put("nextStep", "PROFILE_COMPLETION");
                resp.put("userId", user.getId());
                resp.put("email", user.getEmail());
                resp.put("mobileNumber", user.getMobileNumber());
                resp.put("message", "Academic profile completion required before accessing the platform.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(resp);
            }

            // Active Student -> Send Login OTP (LOGIN_VERIFICATION purpose)
            // 60s cooldown check
            Optional<OtpVerification> recentOpt = otpVerificationRepository
                    .findFirstByUserIdAndPurposeAndVerifiedFalseOrderByCreatedAtDesc(user.getId(), "LOGIN_VERIFICATION");
            if (recentOpt.isPresent() && recentOpt.get().getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(60))) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("requiresLoginOtp", true);
                resp.put("userId", user.getId());
                resp.put("email", user.getEmail());
                resp.put("maskedEmail", maskEmail(user.getEmail()));
                resp.put("message", "A verification code was recently sent to your email. Please check your inbox.");
                return ResponseEntity.ok(resp);
            }

            String otp = generate6DigitOtp();
            String otpHash = passwordEncoder.encode(otp);

            boolean emailSent = emailService.sendLoginEmailOtp(user.getEmail(), user.getFullName(), otp, "LOGIN_OTP_" + user.getId() + "_" + System.currentTimeMillis());

            if (!emailSent) {
                logger.error("Login OTP email delivery failed via Gmail SMTP for recipient userId {}", user.getId());
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("error", "Unable to send verification email. Please try again.");
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(err);
            }

            OtpVerification otpEntity = OtpVerification.builder()
                    .userId(user.getId())
                    .purpose("LOGIN_VERIFICATION")
                    .otpHash(otpHash)
                    .expiresAt(LocalDateTime.now().plusMinutes(5))
                    .attempts(0)
                    .verified(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            otpVerificationRepository.save(otpEntity);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("requiresLoginOtp", true);
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("maskedEmail", maskEmail(user.getEmail()));
            response.put("message", "Verification code sent to " + maskEmail(user.getEmail()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Authentication exception in /api/auth/login: ", e);
            Map<String, String> err = new HashMap<>();
            err.put("error", "Unable to complete login right now. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String fullName = request.get("fullName") != null ? request.get("fullName") : request.get("name");
            String mobileNumber = request.get("mobileNumber");
            String password = request.get("password");

            if (email == null || email.isBlank() || password == null || password.isBlank() || fullName == null || fullName.isBlank()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Full name, email, and password are required.");
                return ResponseEntity.badRequest().body(error);
            }

            if (userRepository.existsByEmail(email)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email is already registered! Please sign in.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            if (mobileNumber != null && !mobileNumber.isBlank() && userRepository.existsByMobileNumber(mobileNumber)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Mobile number is already registered! Please use another number or sign in.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            Role studentRole = roleRepository.findByName("ROLE_STUDENT")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_STUDENT").build()));

            User user = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .mobileNumber(mobileNumber)
                    .passwordHash(passwordEncoder.encode(password))
                    .emailVerified(false)
                    .mobileVerified(true)
                    .accountStatus("PENDING_VERIFICATION")
                    .roles(Collections.singleton(studentRole))
                    .build();

            User savedUser = userRepository.save(user);

            // Generate and send Email OTP
            String otp = generate6DigitOtp();
            String otpHash = passwordEncoder.encode(otp);

            boolean emailSent = emailService.sendEmailOtp(email, fullName, otp, "EMAIL_OTP_" + savedUser.getId() + "_" + System.currentTimeMillis());
            if (!emailSent) {
                logger.error("Registration OTP email delivery failed via Gmail SMTP for recipient userId {}", savedUser.getId());
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("error", "Unable to send verification email. Please try again.");
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(err);
            }

            OtpVerification otpEntity = OtpVerification.builder()
                    .userId(savedUser.getId())
                    .purpose("EMAIL_VERIFICATION")
                    .otpHash(otpHash)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .attempts(0)
                    .verified(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            otpVerificationRepository.save(otpEntity);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration started. Email verification OTP sent.");
            response.put("nextStep", "EMAIL_VERIFICATION");
            response.put("userId", savedUser.getId());
            response.put("email", email);
            response.put("mobileNumber", mobileNumber);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Unable to create your account right now. Please check details and try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @PostMapping("/send-email-otp")
    public ResponseEntity<?> sendEmailOtp(@RequestBody Map<String, Object> body) {
        try {
            Long userId = null;
            if (body != null && body.get("userId") != null) {
                userId = Long.parseLong(body.get("userId").toString());
            } else if (body != null && body.get("email") != null) {
                User u = userRepository.findByEmail(body.get("email").toString()).orElse(null);
                if (u != null) userId = u.getId();
            }

            if (userId == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "User ID or email is required.");
                return ResponseEntity.badRequest().body(err);
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "User account not found.");
                return ResponseEntity.badRequest().body(err);
            }

            // 60s cooldown check
            Optional<OtpVerification> recentOpt = otpVerificationRepository
                    .findFirstByUserIdAndPurposeAndVerifiedFalseOrderByCreatedAtDesc(userId, "EMAIL_VERIFICATION");
            if (recentOpt.isPresent() && recentOpt.get().getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(60))) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Please wait 60 seconds before requesting a new code.");
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(err);
            }

            String otp = generate6DigitOtp();
            String otpHash = passwordEncoder.encode(otp);

            boolean emailSent = emailService.sendEmailOtp(user.getEmail(), user.getFullName(), otp, "RE_EMAIL_OTP_" + user.getId() + "_" + System.currentTimeMillis());
            if (!emailSent) {
                logger.error("Resend Email OTP delivery failed via Gmail SMTP for recipient userId {}", user.getId());
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("error", "Unable to send verification email. Please try again.");
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(err);
            }

            OtpVerification otpEntity = OtpVerification.builder()
                    .userId(user.getId())
                    .purpose("EMAIL_VERIFICATION")
                    .otpHash(otpHash)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .attempts(0)
                    .verified(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            otpVerificationRepository.save(otpEntity);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Verification OTP sent to email.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Unable to send verification code. Please try again.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<?> verifyEmailOtp(@RequestBody Map<String, String> body) {
        try {
            if (body.get("userId") == null || body.get("otp") == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "User ID and OTP code are required.");
                return ResponseEntity.badRequest().body(err);
            }

            Long userId = Long.parseLong(body.get("userId"));
            String otpEntered = body.get("otp");

            User user = userRepository.findById(userId).orElseThrow();
            Optional<OtpVerification> otpOpt = otpVerificationRepository
                    .findFirstByUserIdAndPurposeAndVerifiedFalseOrderByCreatedAtDesc(userId, "EMAIL_VERIFICATION");

            if (otpOpt.isEmpty()) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "No pending email OTP found. Please request a new OTP.");
                return ResponseEntity.badRequest().body(err);
            }

            OtpVerification otpRecord = otpOpt.get();

            if (otpRecord.getExpiresAt().isBefore(LocalDateTime.now())) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "OTP has expired. Please request a new code.");
                return ResponseEntity.badRequest().body(err);
            }

            if (otpRecord.getAttempts() >= 5) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Maximum verification attempts exceeded. Please request a new code.");
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(err);
            }

            otpRecord.setAttempts(otpRecord.getAttempts() + 1);
            otpRecord.setLastAttemptAt(LocalDateTime.now());

            if (!passwordEncoder.matches(otpEntered, otpRecord.getOtpHash())) {
                otpVerificationRepository.save(otpRecord);
                Map<String, String> err = new HashMap<>();
                err.put("error", "Invalid OTP entered. Please check the code and try again.");
                return ResponseEntity.badRequest().body(err);
            }

            otpRecord.setVerified(true);
            otpVerificationRepository.save(otpRecord);

            user.setEmailVerified(true);
            user.setMobileVerified(true);
            user.setAccountStatus("PROFILE_INCOMPLETE");
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email verified successfully.");
            response.put("nextStep", "PROFILE_COMPLETION");
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("mobileNumber", user.getMobileNumber());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Unable to verify email OTP right now. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.parseLong(body.get("userId").toString());
            User user = userRepository.findById(userId).orElseThrow();

            String collegeName = body.getOrDefault("collegeName", "").toString();
            Integer intermediateYear = Integer.parseInt(body.getOrDefault("intermediateYear", "2").toString());
            String board = body.getOrDefault("board", "BIEAP").toString();
            String targetExam = body.getOrDefault("targetExam", "AP_EAPCET").toString();
            String targetBranch = body.getOrDefault("targetBranch", "CSE").toString();
            String state = body.getOrDefault("state", "Andhra Pradesh").toString();
            String city = body.getOrDefault("city", "Visakhapatnam").toString();

            StudentProfile profile = user.getProfile();
            if (profile == null) {
                profile = StudentProfile.builder().build();
            }
            profile.setUser(user);

            profile.setCollegeName(collegeName);
            profile.setIntermediateYear(intermediateYear);
            profile.setBoard(board);
            profile.setTargetExam(targetExam);
            profile.setTargetBranch(targetBranch);
            profile.setState(state);
            profile.setCity(city);
            profile.setPreferredLocation(city);
            profile.setProfileCompleted(true);

            user.setProfile(profile);
            user.setEmailVerified(true);
            user.setMobileVerified(true);
            user.setAccountStatus("ACTIVE");
            userRepository.save(user);

            // Send Welcome Email
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

            String jwt = tokenProvider.generateToken(user.getEmail(), "ROLE_STUDENT");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Your LWR Connecting profile is ready! 🎉");
            response.put("nextStep", "ACTIVE");
            response.put("token", jwt);
            response.put("userId", user.getId());
            response.put("fullName", user.getFullName());
            response.put("email", user.getEmail());
            response.put("mobileNumber", user.getMobileNumber());
            response.put("role", "ROLE_STUDENT");
            response.put("accountStatus", "ACTIVE");
            response.put("profile", Map.of(
                    "collegeName", collegeName,
                    "intermediateYear", intermediateYear,
                    "board", board,
                    "targetExam", targetExam,
                    "targetBranch", targetBranch,
                    "state", state,
                    "city", city
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Unable to complete profile right now. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @PostMapping("/send-login-otp")
    public ResponseEntity<?> sendLoginOtp(@RequestBody Map<String, Object> body) {
        try {
            Long userId = null;
            if (body != null && body.get("userId") != null) {
                userId = Long.parseLong(body.get("userId").toString());
            } else if (body != null && body.get("email") != null) {
                User u = userRepository.findByEmail(body.get("email").toString()).orElse(null);
                if (u != null) userId = u.getId();
            }

            if (userId == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "User ID is required.");
                return ResponseEntity.badRequest().body(err);
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !Boolean.TRUE.equals(user.getEmailVerified())) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "User account not found or email is not verified.");
                return ResponseEntity.badRequest().body(err);
            }

            // 60s cooldown check for LOGIN_VERIFICATION
            Optional<OtpVerification> recentOpt = otpVerificationRepository
                    .findFirstByUserIdAndPurposeAndVerifiedFalseOrderByCreatedAtDesc(userId, "LOGIN_VERIFICATION");
            if (recentOpt.isPresent() && recentOpt.get().getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(60))) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Please wait 60 seconds before requesting a new login code.");
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(err);
            }

            String otp = generate6DigitOtp();
            String otpHash = passwordEncoder.encode(otp);

            boolean emailSent = emailService.sendLoginEmailOtp(user.getEmail(), user.getFullName(), otp, "RE_LOGIN_OTP_" + user.getId() + "_" + System.currentTimeMillis());

            if (!emailSent) {
                logger.error("Resend Login OTP email delivery failed via Gmail SMTP for recipient userId {}", user.getId());
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("error", "Unable to send verification email. Please try again.");
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(err);
            }

            OtpVerification otpEntity = OtpVerification.builder()
                    .userId(user.getId())
                    .purpose("LOGIN_VERIFICATION")
                    .otpHash(otpHash)
                    .expiresAt(LocalDateTime.now().plusMinutes(5))
                    .attempts(0)
                    .verified(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            otpVerificationRepository.save(otpEntity);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login OTP resent to email.");
            response.put("maskedEmail", maskEmail(user.getEmail()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Unable to resend login OTP. Please try again.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    @PostMapping("/test-smtp")
    public ResponseEntity<?> testSmtp(@RequestBody Map<String, String> body) {
        try {
            String email = body != null ? body.get("email") : null;
            if (email == null || email.isBlank()) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Email parameter is required.");
                return ResponseEntity.badRequest().body(err);
            }

            boolean success = emailService.sendTestEmail(email.trim());
            if (success) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("message", "Test email dispatched successfully to " + email.trim());
                return ResponseEntity.ok(resp);
            } else {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", false);
                resp.put("error", "SMTP test email delivery failed. Check server logs for details.");
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(resp);
            }
        } catch (Exception e) {
            logger.error("Error in test-smtp endpoint: ", e);
            Map<String, String> err = new HashMap<>();
            err.put("error", "SMTP test failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @PostMapping("/verify-login-otp")
    public ResponseEntity<?> verifyLoginOtp(@RequestBody Map<String, String> body) {
        try {
            if (body.get("userId") == null || body.get("otp") == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "User ID and OTP code are required.");
                return ResponseEntity.badRequest().body(err);
            }

            Long userId = Long.parseLong(body.get("userId"));
            String otpEntered = body.get("otp").trim();

            User user = userRepository.findById(userId).orElseThrow();
            Optional<OtpVerification> otpOpt = otpVerificationRepository
                    .findFirstByUserIdAndPurposeAndVerifiedFalseOrderByCreatedAtDesc(userId, "LOGIN_VERIFICATION");

            if (otpOpt.isEmpty()) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "No pending login OTP found. Please request a new code.");
                return ResponseEntity.badRequest().body(err);
            }

            OtpVerification otpRecord = otpOpt.get();

            if (otpRecord.getExpiresAt().isBefore(LocalDateTime.now())) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Login OTP has expired. Please request a new code.");
                return ResponseEntity.badRequest().body(err);
            }

            if (otpRecord.getAttempts() >= 5) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Maximum verification attempts exceeded. Please request a new code.");
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(err);
            }

            otpRecord.setAttempts(otpRecord.getAttempts() + 1);
            otpRecord.setLastAttemptAt(LocalDateTime.now());

            if (!passwordEncoder.matches(otpEntered, otpRecord.getOtpHash())) {
                otpVerificationRepository.save(otpRecord);
                Map<String, String> err = new HashMap<>();
                err.put("error", "Invalid OTP code entered. Please check the code and try again.");
                return ResponseEntity.badRequest().body(err);
            }

            // Single-use: mark verified
            otpRecord.setVerified(true);
            otpVerificationRepository.save(otpRecord);

            String role = user.getRoles().stream().findFirst().map(Role::getName).orElse("ROLE_STUDENT");
            String jwt = tokenProvider.generateToken(user.getEmail(), role);

            return ResponseEntity.ok(AuthResponse.builder()
                    .token(jwt)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(role)
                    .build());
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Unable to verify login OTP right now. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        String role = user.getRoles().stream().findFirst().map(Role::getName).orElse("ROLE_STUDENT");

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("mobileNumber", user.getMobileNumber());
        response.put("role", role);
        response.put("accountStatus", user.getAccountStatus());
        response.put("emailVerified", user.getEmailVerified());
        response.put("mobileVerified", user.getMobileVerified());
        response.put("profileCompleted", user.getProfile() != null ? user.getProfile().getProfileCompleted() : false);
        return ResponseEntity.ok(response);
    }
}
