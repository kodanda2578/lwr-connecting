package com.lwr.connecting.controller;

import com.lwr.connecting.dto.AuthResponse;
import com.lwr.connecting.dto.LoginRequest;
import com.lwr.connecting.entity.Role;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.UserRepository;
import com.lwr.connecting.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/auth")
public class AdminAuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateAdmin(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();
            String role = user.getRoles().stream().findFirst().map(Role::getName).orElse("ROLE_STUDENT");

            // Strict Role Check: Student accounts MUST NEVER log in via Admin portal
            if (!"ROLE_ADMIN".equals(role)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Admin access required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
            }

            String jwt = tokenProvider.generateToken(user.getEmail(), role);

            return ResponseEntity.ok(AuthResponse.builder()
                    .token(jwt)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role("ROLE_ADMIN")
                    .build());
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Invalid admin credentials. Please try again.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }
    }
}
