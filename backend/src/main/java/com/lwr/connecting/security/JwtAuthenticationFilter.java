package com.lwr.connecting.security;

import com.lwr.connecting.entity.Role;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserDetailsService customUserDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Override
    @SuppressWarnings("null")
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String email = tokenProvider.getEmailFromJWT(jwt);
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Enforce Server-Side Onboarding State Security for Protected Student Endpoints
                String path = request.getRequestURI();
                if (!path.startsWith("/api/auth/") && !path.startsWith("/api/admin/auth/") && !path.startsWith("/api/colleges") && !path.startsWith("/api/cutoffs") && !path.startsWith("/api/exams") && !path.startsWith("/api/branches")) {
                    User user = userRepository.findByEmail(email).orElse(null);
                    if (user != null) {
                        String role = user.getRoles().stream().findFirst().map(Role::getName).orElse("ROLE_STUDENT");
                        if (!"ROLE_ADMIN".equals(role) && !"ACTIVE".equalsIgnoreCase(user.getAccountStatus())) {
                            String code = "EMAIL_VERIFICATION_REQUIRED";
                            if (Boolean.TRUE.equals(user.getEmailVerified()) && !Boolean.TRUE.equals(user.getMobileVerified())) {
                                code = "MOBILE_VERIFICATION_REQUIRED";
                            } else if (Boolean.TRUE.equals(user.getEmailVerified()) && Boolean.TRUE.equals(user.getMobileVerified())) {
                                code = "PROFILE_COMPLETION_REQUIRED";
                            }

                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write(String.format("{\"error\":\"Forbidden\",\"code\":\"%s\",\"message\":\"Complete verification before accessing protected platform features.\"}", code));
                            return;
                        }
                    }
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
