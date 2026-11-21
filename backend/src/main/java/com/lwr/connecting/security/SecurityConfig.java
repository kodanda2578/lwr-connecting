package com.lwr.connecting.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000}")
    private String allowedOriginsConfig;

    @Autowired(required = false)
    private Environment environment;

    private boolean isProductionEnvironment() {
        if (environment == null) {
            return false;
        }
        for (String profile : environment.getActiveProfiles()) {
            if ("prod".equalsIgnoreCase(profile) || "production".equalsIgnoreCase(profile)) {
                return true;
            }
        }
        return false;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/health", "/health/**", "/api/health", "/api/health/**").permitAll()
                .requestMatchers("/auth/**", "/api/auth/**", "/admin/auth/**", "/api/admin/auth/**", "/error", "/api/error", "/ai/**", "/api/ai/**", "/beta/status", "/api/beta/status", "/beta/validate-invite", "/api/beta/validate-invite").permitAll()
                .requestMatchers(HttpMethod.GET, 
                        "/exams", "/exams/**", "/api/exams", "/api/exams/**",
                        "/subjects", "/subjects/**", "/api/subjects", "/api/subjects/**",
                        "/topics", "/topics/**", "/api/topics", "/api/topics/**",
                        "/subtopics", "/subtopics/**", "/api/subtopics", "/api/subtopics/**",
                        "/questions", "/questions/**", "/api/questions", "/api/questions/**",
                        "/states", "/states/**", "/api/states", "/api/states/**",
                        "/colleges", "/colleges/**", "/api/colleges", "/api/colleges/**",
                        "/cutoffs", "/cutoffs/**", "/api/cutoffs", "/api/cutoffs/**",
                        "/branches", "/branches/**", "/api/branches", "/api/branches/**",
                        "/data-ingestion/status", "/api/data-ingestion/status",
                        "/mock-tests", "/mock-tests/**", "/api/mock-tests", "/api/mock-tests/**").permitAll()
                .requestMatchers("/college-predictor", "/rank-estimator").permitAll()
                .requestMatchers("/guidance-requests", "/guidance-requests/**", "/api/guidance-requests", "/api/guidance-requests/**").permitAll()
                .requestMatchers("/admin/**", "/api/admin/**", "/beta/admin/**", "/api/beta/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        List<String> origins = new ArrayList<>();
        boolean isProd = isProductionEnvironment();

        // Include localhost and loopback origin patterns ONLY in non-production/local development
        if (!isProd) {
            origins.add("http://localhost:*");
            origins.add("http://127.0.0.1:*");
            origins.add("http://localhost:5173");
            origins.add("http://localhost:3000");
        }

        if (allowedOriginsConfig != null && !allowedOriginsConfig.isBlank()) {
            for (String origin : allowedOriginsConfig.split(",")) {
                String trimmed = origin.trim();
                // Reject unrestricted wildcard origin when credentials are permitted
                if (!trimmed.isEmpty() && !origins.contains(trimmed) && !"*".equals(trimmed)) {
                    origins.add(trimmed);
                }
            }
        }

        configuration.setAllowedOriginPatterns(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
