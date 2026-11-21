package com.lwr.connecting;

import com.lwr.connecting.controller.HealthController;
import com.lwr.connecting.security.JwtTokenProvider;
import com.lwr.connecting.security.SecurityConfig;
import com.lwr.connecting.service.impl.DatabaseBackupServiceImpl;
import com.lwr.connecting.service.impl.EmailServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import javax.sql.DataSource;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class CloudDeploymentConfigurationTest {

    @Test
    @DisplayName("Public Health Endpoint - GET /health and /api/health return 200 UP without secrets")
    public void testPublicHealthEndpoints() throws Exception {
        HealthController healthController = new HealthController();
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(healthController).build();

        // 1. GET /health
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.secret").doesNotExist())
                .andExpect(jsonPath("$.token").doesNotExist());

        // 2. GET /api/health
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.secret").doesNotExist())
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    @DisplayName("CORS Configuration - Dev keeps localhost, production omits localhost, rejects unrestricted wildcard")
    public void testCorsConfiguration() {
        // 1. In development / default mode: localhost origins are preserved
        SecurityConfig devSecurityConfig = new SecurityConfig();
        MockEnvironment devEnv = new MockEnvironment();
        ReflectionTestUtils.setField(devSecurityConfig, "environment", devEnv);
        ReflectionTestUtils.setField(devSecurityConfig, "allowedOriginsConfig",
                "https://lwr-connecting.vercel.app,https://*.vercel.app,https://lwrconnecting.com");

        CorsConfigurationSource devSource = devSecurityConfig.corsConfigurationSource();
        assertNotNull(devSource, "CorsConfigurationSource should be created");

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/colleges");
        request.addHeader("Origin", "https://lwr-connecting.vercel.app");

        CorsConfiguration devConfig = devSource.getCorsConfiguration(request);
        assertNotNull(devConfig, "CorsConfiguration should be resolved");

        var devPatterns = devConfig.getAllowedOriginPatterns();
        assertNotNull(devPatterns, "Allowed origin patterns must be present");
        assertTrue(devPatterns.contains("http://localhost:*"), "Dev must contain localhost wildcard");
        assertTrue(devPatterns.contains("http://127.0.0.1:*"), "Dev must contain 127.0.0.1 loopback");
        assertTrue(devPatterns.contains("https://lwr-connecting.vercel.app"), "Dev must contain configured Vercel origin");
        assertTrue(devPatterns.contains("https://*.vercel.app"), "Dev must contain Vercel preview domain pattern");
        assertTrue(devPatterns.contains("https://lwrconnecting.com"), "Dev must contain custom production domain");
        assertTrue(devConfig.getAllowCredentials(), "AllowCredentials should be true");
        assertFalse(devPatterns.contains("*"), "Unrestricted wildcard '*' with credentials must NOT be allowed");

        // 2. In production profile: localhost origins must NOT be included
        SecurityConfig prodSecurityConfig = new SecurityConfig();
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");
        ReflectionTestUtils.setField(prodSecurityConfig, "environment", prodEnv);
        ReflectionTestUtils.setField(prodSecurityConfig, "allowedOriginsConfig",
                "https://lwr-connecting.vercel.app,https://*.vercel.app,https://lwrconnecting.com");

        CorsConfigurationSource prodSource = prodSecurityConfig.corsConfigurationSource();
        CorsConfiguration prodConfig = prodSource.getCorsConfiguration(request);
        assertNotNull(prodConfig, "Production CorsConfiguration should be resolved");

        var prodPatterns = prodConfig.getAllowedOriginPatterns();
        assertNotNull(prodPatterns, "Production patterns must be present");
        assertFalse(prodPatterns.contains("http://localhost:*"), "Production must NOT contain localhost wildcard");
        assertFalse(prodPatterns.contains("http://127.0.0.1:*"), "Production must NOT contain 127.0.0.1 loopback");
        assertFalse(prodPatterns.contains("http://localhost:5173"), "Production must NOT contain localhost:5173");
        assertFalse(prodPatterns.contains("http://localhost:3000"), "Production must NOT contain localhost:3000");
        assertTrue(prodPatterns.contains("https://lwr-connecting.vercel.app"), "Production must contain configured Vercel origin");
        assertTrue(prodPatterns.contains("https://*.vercel.app"), "Production must contain Vercel preview domain pattern");
        assertTrue(prodPatterns.contains("https://lwrconnecting.com"), "Production must contain custom production domain");
        assertTrue(prodConfig.getAllowCredentials(), "AllowCredentials should be true");
        assertFalse(prodPatterns.contains("*"), "Unrestricted wildcard '*' with credentials must NOT be allowed in production");
    }

    @Test
    @DisplayName("JWT Security - Production profile rejects missing or default JWT_SECRET")
    public void testJwtSecurityValidationInProduction() {
        JwtTokenProvider provider = new JwtTokenProvider();

        // 1. In dev/default profile (non-prod), default dev key is accepted
        MockEnvironment devEnv = new MockEnvironment();
        ReflectionTestUtils.setField(provider, "environment", devEnv);
        ReflectionTestUtils.setField(provider, "jwtSecret", JwtTokenProvider.DEFAULT_DEV_JWT_SECRET);
        assertDoesNotThrow(provider::validateJwtSecurity, "Dev environment should allow default key");

        // 2. In prod profile, default key must throw IllegalStateException
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");
        ReflectionTestUtils.setField(provider, "environment", prodEnv);
        ReflectionTestUtils.setField(provider, "jwtSecret", JwtTokenProvider.DEFAULT_DEV_JWT_SECRET);
        IllegalStateException ex1 = assertThrows(IllegalStateException.class, provider::validateJwtSecurity);
        assertTrue(ex1.getMessage().contains("JWT_SECRET must be configured with a custom, secure secret"));

        // 3. In prod profile, empty secret must throw IllegalStateException
        ReflectionTestUtils.setField(provider, "jwtSecret", "   ");
        IllegalStateException ex2 = assertThrows(IllegalStateException.class, provider::validateJwtSecurity);
        assertTrue(ex2.getMessage().contains("JWT_SECRET must be configured with a custom, secure secret"));

        // 4. In prod profile, a secure custom secret passes
        ReflectionTestUtils.setField(provider, "jwtSecret", "my_custom_super_secret_production_key_for_render_2026_ok!");
        assertDoesNotThrow(provider::validateJwtSecurity, "Custom strong secret in prod profile should pass");
    }

    @Test
    @DisplayName("Email Links - Uses configured APP_FRONTEND_URL dynamically with localhost fallback")
    public void testEmailLinksDynamicConfiguration() {
        EmailServiceImpl emailService = new EmailServiceImpl();

        // 1. With configured production frontend URL
        ReflectionTestUtils.setField(emailService, "appFrontendUrl", "https://lwr-connecting.vercel.app");
        assertEquals("https://lwr-connecting.vercel.app/doubt-sessions", emailService.getStudentPortalDoubtSessionsUrl());

        // 2. With configured domain URL
        ReflectionTestUtils.setField(emailService, "appFrontendUrl", "https://lwrconnecting.com");
        assertEquals("https://lwrconnecting.com/doubt-sessions", emailService.getStudentPortalDoubtSessionsUrl());

        // 3. Trailing slash normalization
        ReflectionTestUtils.setField(emailService, "appFrontendUrl", "https://lwrconnecting.com/");
        assertEquals("https://lwrconnecting.com/doubt-sessions", emailService.getStudentPortalDoubtSessionsUrl());

        // 4. Default fallback when empty
        ReflectionTestUtils.setField(emailService, "appFrontendUrl", "   ");
        assertEquals("http://localhost:5173/doubt-sessions", emailService.getStudentPortalDoubtSessionsUrl());
    }

    @Test
    @DisplayName("Database Backup - H2 mode detects H2; PostgreSQL mode returns managed message without executing SQL")
    public void testDatabaseBackupH2AndPostgresModes() {
        // 1. Test H2 Detection with Mock H2 DataSource
        DatabaseMetaData h2MetaDataProxy = (DatabaseMetaData) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{DatabaseMetaData.class},
                (proxy, method, args) -> {
                    if ("getDatabaseProductName".equals(method.getName())) return "H2";
                    if ("getURL".equals(method.getName())) return "jdbc:h2:file:./data/lwr_db";
                    return null;
                }
        );
        Connection h2ConnProxy = (Connection) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{Connection.class},
                (proxy, method, args) -> "getMetaData".equals(method.getName()) ? h2MetaDataProxy : null
        );
        DataSource h2DataSourceProxy = (DataSource) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{DataSource.class},
                (proxy, method, args) -> "getConnection".equals(method.getName()) ? h2ConnProxy : null
        );
        DatabaseBackupServiceImpl h2BackupService = new DatabaseBackupServiceImpl(new JdbcTemplate(h2DataSourceProxy));
        assertTrue(h2BackupService.isH2Database(), "Should detect H2 database");

        // 2. Test PostgreSQL Mode with Mock PostgreSQL DataSource
        AtomicBoolean sqlExecuted = new AtomicBoolean(false);

        DatabaseMetaData pgMetaDataProxy = (DatabaseMetaData) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{DatabaseMetaData.class},
                (proxy, method, args) -> {
                    if ("getDatabaseProductName".equals(method.getName())) return "PostgreSQL";
                    if ("getURL".equals(method.getName())) return "jdbc:postgresql://ep-example.render.com/lwr_db";
                    return null;
                }
        );

        Connection pgConnProxy = (Connection) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{Connection.class},
                (proxy, method, args) -> {
                    if ("getMetaData".equals(method.getName())) return pgMetaDataProxy;
                    if ("createStatement".equals(method.getName()) || "prepareStatement".equals(method.getName())) {
                        sqlExecuted.set(true);
                        throw new UnsupportedOperationException("No SQL statements should be executed against PostgreSQL during backup");
                    }
                    return null;
                }
        );

        DataSource pgDataSourceProxy = (DataSource) Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class<?>[]{DataSource.class},
                (proxy, method, args) -> "getConnection".equals(method.getName()) ? pgConnProxy : null
        );

        DatabaseBackupServiceImpl pgBackupService = new DatabaseBackupServiceImpl(new JdbcTemplate(pgDataSourceProxy));

        assertFalse(pgBackupService.isH2Database(), "Should detect database is NOT H2");

        // Verify createBackup returns managed snapshot result without executing SQL
        Map<String, Object> pgBackupResult = pgBackupService.createBackup();
        assertTrue((Boolean) pgBackupResult.get("success"), "PostgreSQL createBackup should report success");
        assertEquals("PostgreSQL", pgBackupResult.get("databaseType"));
        assertTrue(((String) pgBackupResult.get("message")).contains("PostgreSQL hosting and its backup mechanism"));
        assertFalse(sqlExecuted.get(), "No SQL statements must be executed on PostgreSQL");

        // Verify verifyBackup returns managed snapshot result without executing SQL
        Map<String, Object> pgVerifyResult = pgBackupService.verifyBackup("managed-snapshot");
        assertTrue((Boolean) pgVerifyResult.get("verified"), "PostgreSQL verifyBackup should report verified");
        assertEquals("PostgreSQL", pgVerifyResult.get("databaseType"));
        assertTrue(((String) pgVerifyResult.get("message")).contains("PostgreSQL hosting and its backup mechanism"));
        assertFalse(sqlExecuted.get(), "No SQL statements must be executed on PostgreSQL");
    }
}
