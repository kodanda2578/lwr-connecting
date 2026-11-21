package com.lwr.connecting.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseSchemaMigrationPostProcessor implements BeanPostProcessor {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSchemaMigrationPostProcessor.class);

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSource) {
            DataSource ds = (DataSource) bean;
            try (Connection conn = ds.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                logger.info("[SCHEMA MIGRATION] Running safe idempotent schema updates on DataSource...");
                try {
                    stmt.execute("ALTER TABLE beta_access_config ADD COLUMN IF NOT EXISTS invite_only_mode BOOLEAN DEFAULT TRUE");
                    stmt.execute("ALTER TABLE beta_access_config ADD COLUMN IF NOT EXISTS failed_registration_count BIGINT DEFAULT 0");
                    logger.info("[SCHEMA MIGRATION SUCCESS] beta_access_config columns verified.");
                } catch (Exception ex) {
                    logger.debug("[SCHEMA MIGRATION] Notice on beta_access_config migration: {}", ex.getMessage());
                }

            } catch (Exception e) {
                logger.warn("[SCHEMA MIGRATION] Could not execute schema migration on DataSource: {}", e.getMessage());
            }
        }
        return bean;
    }
}

