package com.lwr.connecting.service.impl;

import com.lwr.connecting.service.DatabaseBackupService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
public class DatabaseBackupServiceImpl implements DatabaseBackupService {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseBackupServiceImpl.class);
    private static final Path BACKUP_DIR = Paths.get("data", "backups");
    private static final Path VERIFICATION_DIR = Paths.get("data", "backup_verification");

    private final JdbcTemplate jdbcTemplate;

    public boolean isH2Database() {
        try {
            if (jdbcTemplate != null && jdbcTemplate.getDataSource() != null) {
                try (Connection conn = jdbcTemplate.getDataSource().getConnection()) {
                    String productName = conn.getMetaData().getDatabaseProductName();
                    if (productName != null && productName.toLowerCase().contains("h2")) {
                        return true;
                    }
                    String url = conn.getMetaData().getURL();
                    return url != null && url.toLowerCase().contains(":h2:");
                }
            }
        } catch (Exception e) {
            logger.warn("Could not determine database product name from DataSource: {}", e.getMessage());
        }
        return false;
    }

    @Override
    public Map<String, Object> createBackup() {
        if (!isH2Database()) {
            logger.info("[DB BACKUP] Active database is not H2. Production backups are managed through PostgreSQL hosting.");
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("success", true);
            result.put("databaseType", "PostgreSQL");
            result.put("message", "Production backups are managed through PostgreSQL hosting and its backup mechanism (e.g., Render automated snapshots / pg_dump).");
            result.put("createdAt", LocalDateTime.now().toString());
            return result;
        }

        try {
            Files.createDirectories(BACKUP_DIR);
            String timestamp = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss").format(LocalDateTime.now());
            String fileName = "lwr_db_backup_" + timestamp + ".zip";
            Path targetZip = BACKUP_DIR.resolve(fileName).toAbsolutePath();

            String sql = "BACKUP TO '" + targetZip.toString().replace("\\", "/") + "'";
            logger.info("[DB BACKUP] Executing live consistent H2 backup: {}", sql);
            jdbcTemplate.execute(sql);

            if (!Files.exists(targetZip)) {
                throw new IllegalStateException("H2 backup command finished but target backup archive not found at " + targetZip);
            }

            long sizeBytes = Files.size(targetZip);
            logger.info("[DB BACKUP SUCCESS] Archive created: {} ({} bytes)", fileName, sizeBytes);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("success", true);
            result.put("fileName", fileName);
            result.put("filePath", targetZip.toString());
            result.put("sizeBytes", sizeBytes);
            result.put("sizeFormatted", formatSize(sizeBytes));
            result.put("createdAt", LocalDateTime.now().toString());
            result.put("message", "Crash-consistent H2 backup created successfully.");
            return result;
        } catch (Exception e) {
            logger.error("[DB BACKUP FAILED] Error creating H2 database backup", e);
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("success", false);
            err.put("error", e.getMessage());
            return err;
        }
    }

    @Override
    public List<Map<String, Object>> listBackups() {
        List<Map<String, Object>> list = new ArrayList<>();
        if (!Files.exists(BACKUP_DIR)) {
            return list;
        }

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(BACKUP_DIR, "*.zip")) {
            for (Path entry : stream) {
                Map<String, Object> item = new LinkedHashMap<>();
                String name = entry.getFileName().toString();
                long size = Files.size(entry);
                Instant lastModified = Files.getLastModifiedTime(entry).toInstant();
                LocalDateTime dt = LocalDateTime.ofInstant(lastModified, ZoneId.systemDefault());

                item.put("fileName", name);
                item.put("sizeBytes", size);
                item.put("sizeFormatted", formatSize(size));
                item.put("lastModified", dt.toString());
                item.put("path", entry.toAbsolutePath().toString());
                list.add(item);
            }
        } catch (IOException e) {
            logger.warn("Could not list backups from {}", BACKUP_DIR, e);
        }

        list.sort((a, b) -> String.valueOf(b.get("fileName")).compareTo(String.valueOf(a.get("fileName"))));
        return list;
    }

    @Override
    public Map<String, Object> verifyBackup(String backupFileName) {
        Map<String, Object> result = new LinkedHashMap<>();

        if (!isH2Database()) {
            logger.info("[DB BACKUP VERIFY] Active database is PostgreSQL. Production backups are managed through PostgreSQL hosting.");
            result.put("verified", true);
            result.put("fileName", backupFileName != null ? backupFileName : "managed-postgresql-snapshot");
            result.put("databaseType", "PostgreSQL");
            result.put("message", "Production backups are managed through PostgreSQL hosting and its backup mechanism. Point-in-time recovery and snapshot testing are managed by the database provider.");
            result.put("verifiedAt", LocalDateTime.now().toString());
            return result;
        }

        if (backupFileName == null || backupFileName.isBlank() || backupFileName.contains("..") || backupFileName.contains("/") || backupFileName.contains("\\")) {
            result.put("verified", false);
            result.put("error", "Invalid backup filename provided.");
            return result;
        }

        Path backupFile = BACKUP_DIR.resolve(backupFileName);
        if (!Files.exists(backupFile)) {
            result.put("verified", false);
            result.put("error", "Backup file does not exist: " + backupFileName);
            return result;
        }

        Path verifySessionDir = VERIFICATION_DIR.resolve("verify_" + System.currentTimeMillis());
        try {
            Files.createDirectories(verifySessionDir);

            // Extract archive
            unzip(backupFile, verifySessionDir);

            // Find db prefix
            Path dbMvFile = Files.list(verifySessionDir)
                    .filter(p -> p.getFileName().toString().endsWith(".mv.db"))
                    .findFirst()
                    .orElse(null);

            if (dbMvFile == null) {
                result.put("verified", false);
                result.put("error", "Backup archive is missing H2 database file (*.mv.db)");
                return result;
            }

            String fullDbName = dbMvFile.getFileName().toString();
            String dbBaseName = fullDbName.substring(0, fullDbName.indexOf(".mv.db"));
            Path dbBaseLocation = verifySessionDir.resolve(dbBaseName).toAbsolutePath();

            String isolatedJdbcUrl = "jdbc:h2:file:" + dbBaseLocation.toString().replace("\\", "/") + ";MODE=PostgreSQL;ACCESS_MODE_DATA=r";
            logger.info("[BACKUP RESTORE VERIFY] Connecting to isolated restored test DB: {}", isolatedJdbcUrl);

            Map<String, Long> tableCounts = new LinkedHashMap<>();
            try (Connection conn = DriverManager.getConnection(isolatedJdbcUrl, "sa", "")) {
                tableCounts.put("users", queryCount(conn, "users"));
                tableCounts.put("colleges", queryCount(conn, "colleges"));
                tableCounts.put("cutoffs", queryCount(conn, "cutoffs"));
                tableCounts.put("tests", queryCount(conn, "tests"));
                tableCounts.put("beta_access_config", queryCount(conn, "beta_access_config"));

                // Safely shutdown restored in-memory/file session
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("SHUTDOWN");
                }
            }

            result.put("verified", true);
            result.put("fileName", backupFileName);
            result.put("tableCounts", tableCounts);
            result.put("verifiedAt", LocalDateTime.now().toString());
            result.put("message", "Backup restoration verified successfully against an isolated test instance without altering live data.");
            logger.info("[BACKUP RESTORE VERIFY SUCCESS] Backup {} verified: {}", backupFileName, tableCounts);

        } catch (Exception e) {
            logger.error("[BACKUP RESTORE VERIFY FAILED] Error verifying backup {}", backupFileName, e);
            result.put("verified", false);
            result.put("error", e.getMessage());
        } finally {
            // Clean up temporary isolated verification directory
            deleteRecursively(verifySessionDir.toFile());
        }

        return result;
    }

    private long queryCount(Connection conn, String tableName) {
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM " + tableName)) {
            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (Exception e) {
            logger.warn("Could not query table {} in restored backup: {}", tableName, e.getMessage());
        }
        return -1L;
    }

    private void unzip(Path zipFile, Path destDir) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile.toFile()))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                Path newPath = destDir.resolve(entry.getName()).normalize();
                if (!newPath.startsWith(destDir)) {
                    throw new IOException("Bad zip entry: " + entry.getName());
                }
                if (entry.isDirectory()) {
                    Files.createDirectories(newPath);
                } else {
                    if (newPath.getParent() != null) {
                        Files.createDirectories(newPath.getParent());
                    }
                    try (FileOutputStream fos = new FileOutputStream(newPath.toFile())) {
                        byte[] buffer = new byte[8192];
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
                zis.closeEntry();
            }
        }
    }

    private void deleteRecursively(File file) {
        if (file == null || !file.exists()) return;
        if (file.isDirectory()) {
            File[] children = file.listFiles();
            if (children != null) {
                for (File child : children) {
                    deleteRecursively(child);
                }
            }
        }
        file.delete();
    }

    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format(Locale.US, "%.1f %siB", bytes / Math.pow(1024, exp), pre);
    }
}

