package com.lwr.connecting.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    public static final String DEFAULT_DEV_JWT_SECRET = "lwr_connecting_super_secret_jwt_signing_key_2026_production_grade";

    @Autowired
    private Environment environment;

    @Value("${jwt.secret:" + DEFAULT_DEV_JWT_SECRET + "}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms:86400000}")
    private long jwtExpirationInMs;

    @PostConstruct
    public void validateJwtSecurity() {
        List<String> activeProfiles = environment != null ? Arrays.asList(environment.getActiveProfiles()) : java.util.Collections.emptyList();
        boolean isProduction = activeProfiles.contains("prod") || activeProfiles.contains("production");

        if (isProduction) {
            if (jwtSecret == null || jwtSecret.trim().isEmpty() || DEFAULT_DEV_JWT_SECRET.equals(jwtSecret.trim())) {
                String errorMsg = "CRITICAL SECURITY ERROR: JWT_SECRET must be configured with a custom, secure secret in the production profile ('prod'). " +
                        "The known default key or an empty secret is strictly prohibited.";
                logger.error("[JWT SECURITY] {}", errorMsg);
                throw new IllegalStateException(errorMsg);
            }
            logger.info("[JWT SECURITY] Production JWT secret validated successfully.");
        } else {
            logger.info("[JWT SECURITY] Running in non-production profile. Active profiles: {}", activeProfiles);
        }
    }

    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
