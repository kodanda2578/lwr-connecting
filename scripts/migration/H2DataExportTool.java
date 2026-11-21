package scripts.migration;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.sql.*;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * LWR Connecting — Standalone H2 Data Export Utility
 * 
 * Extracts data from the 34 active application tables in the local H2 database
 * using strict read-only mode, preserves exact primary keys and foreign keys,
 * exports cleanly formatted RFC-4180 CSVs, generates sequence synchronization SQL,
 * and produces a tamper-evident cryptographic manifest (SHA-256).
 */
public class H2DataExportTool {

    // Topological table order (Level 0 through Level 6)
    public static final String[] ACTIVE_TABLES = {
        // Level 0: Independent tables (no incoming FKs to other app tables)
        "STATES",
        "ROLES",
        "SUBJECTS",
        "BRANCHES",
        "BETA_ACCESS_CONFIG",
        "BETA_INVITATIONS",
        "CUTOFF_RECORDS",

        // Level 1: Core Users & Exams
        "USERS",
        "EXAMS",

        // Level 2: User Profiles, Direct Relations, and Level 1 Dependents
        "USER_ROLES",
        "STUDENT_PROFILES",
        "EMAIL_PREFERENCES",
        "EMAIL_EVENTS",
        "OTP_VERIFICATIONS",
        "NOTIFICATIONS",
        "COLLEGES",
        "TOPICS",
        "EXAM_TEST_PATTERNS",
        "GUIDANCE_REQUESTS",
        "MENTOR_REQUESTS",
        "MESSAGES",
        "BETA_FEEDBACK",

        // Level 3: Mappings & Dependent Relations
        "APPOINTMENTS",
        "COLLEGE_BRANCH_MAPPINGS",
        "COLLEGE_EXAM_MAPPINGS",
        "CUTOFFS",
        "SUBTOPICS",
        "TESTS",

        // Level 4: Question Bank
        "QUESTIONS",

        // Level 5: Test Execution & Question Validations
        "QUESTION_GENERATION_REQUESTS",
        "QUESTION_VALIDATIONS",
        "TEST_QUESTIONS",
        "TEST_ATTEMPTS",

        // Level 6: Test Submissions
        "TEST_ANSWERS"
    };

    // Obsolete lowercase prototype tables that must NEVER be exported
    public static final Set<String> EXCLUDED_LEGACY_TABLES = Set.of(
        "users", "roles", "user_roles", "exams", "states", "subjects"
    );

    public static void main(String[] args) {
        String dbPath = args.length > 0 ? args[0] : "backend/data/lwr_db";
        String outputDirStr = args.length > 1 ? args[1] : "data_export";

        Path outputDir = Paths.get(outputDirStr).toAbsolutePath();
        System.out.println("=============================================================");
        System.out.println("LWR CONNECTING — H2 DATA EXPORT TOOL (Phase 3B)");
        System.out.println("=============================================================");
        System.out.println("Source database: " + dbPath + ".mv.db (READ-ONLY MODE)");
        System.out.println("Target output:   " + outputDir);
        System.out.println("-------------------------------------------------------------");

        String jdbcUrl = "jdbc:h2:file:" + dbPath.replace("\\", "/") + ";ACCESS_MODE_DATA=r;IFEXISTS=TRUE";

        try {
            Files.createDirectories(outputDir);
        } catch (IOException e) {
            System.err.println("Fatal: Could not create output directory: " + e.getMessage());
            System.exit(1);
        }

        try (Connection conn = DriverManager.getConnection(jdbcUrl, "sa", "")) {
            DatabaseMetaData meta = conn.getMetaData();
            System.out.println("Connected to: " + meta.getDatabaseProductName() + " " + meta.getDatabaseProductVersion());

            // Verify that the connection is strictly read-only
            if (!conn.isReadOnly()) {
                System.out.println("Ensuring connection read-only flag...");
                conn.setReadOnly(true);
            }

            List<Map<String, Object>> manifestTables = new ArrayList<>();
            long totalRowsExported = 0;
            StringBuilder sequenceSql = new StringBuilder();
            sequenceSql.append("-- ============================================================\n");
            sequenceSql.append("-- LWR CONNECTING — POSTGRESQL SEQUENCE SYNCHRONIZATION SCRIPT\n");
            sequenceSql.append("-- Generated: ").append(DateTimeFormatter.ISO_INSTANT.format(Instant.now())).append("\n");
            sequenceSql.append("-- Run AFTER importing CSV data into PostgreSQL tables\n");
            sequenceSql.append("-- ============================================================\n\n");

            for (int i = 0; i < ACTIVE_TABLES.length; i++) {
                String tableName = ACTIVE_TABLES[i];
                int importOrder = i + 1;
                String targetTable = tableName.toLowerCase();
                String csvFileName = String.format("%02d_%s.csv", importOrder, targetTable);
                Path csvPath = outputDir.resolve(csvFileName);

                System.out.printf("[%02d/34] Exporting %-28s -> %-32s ", importOrder, tableName, csvFileName);

                ExportResult result = exportTableToCsv(conn, tableName, targetTable, csvPath);
                totalRowsExported += result.rowCount;
                System.out.printf("(%d rows)%n", result.rowCount);

                // Add to sequence sync if table has an ID sequence (all except USER_ROLES)
                if (!tableName.equals("USER_ROLES")) {
                    sequenceSql.append(String.format(
                        "SELECT setval(pg_get_serial_sequence('%s', 'id'), COALESCE((SELECT MAX(id) FROM %s), 1), (SELECT COUNT(*) FROM %s) > 0);\n",
                        targetTable, targetTable, targetTable
                    ));
                }

                Map<String, Object> tableEntry = new LinkedHashMap<>();
                tableEntry.put("importOrder", importOrder);
                tableEntry.put("targetTable", targetTable);
                tableEntry.put("sourceH2Table", tableName);
                tableEntry.put("fileName", csvFileName);
                tableEntry.put("rowCount", result.rowCount);
                tableEntry.put("maxId", result.maxId);
                tableEntry.put("hasIdSequence", !tableName.equals("USER_ROLES"));
                tableEntry.put("columnCount", result.columns.size());
                tableEntry.put("columns", result.columns);
                tableEntry.put("sha256", result.sha256);
                manifestTables.add(tableEntry);
            }

            // Write sequence synchronization SQL
            Path seqFile = outputDir.resolve("sync_sequences.sql");
            Files.writeString(seqFile, sequenceSql.toString(), StandardCharsets.UTF_8);
            System.out.println("\nGenerated sequence synchronization script: " + seqFile.getFileName());

            // Write PostgreSQL import helper script
            Path importScript = outputDir.resolve("import_postgres.sql");
            writePostgresImportScript(importScript, manifestTables);
            System.out.println("Generated PostgreSQL import script:        " + importScript.getFileName());

            // Write manifest.json
            Path manifestPath = outputDir.resolve("manifest.json");
            writeManifestJson(manifestPath, manifestTables, totalRowsExported, dbPath);
            System.out.println("Generated cryptographic manifest:          " + manifestPath.getFileName());

            System.out.println("-------------------------------------------------------------");
            System.out.printf("EXPORT COMPLETE: 34 tables, %d total records exported successfully.%n", totalRowsExported);
            System.out.println("=============================================================");

        } catch (Exception e) {
            System.err.println("Fatal export error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static ExportResult exportTableToCsv(Connection conn, String h2Table, String targetTable, Path targetCsv) throws Exception {
        String selectSql;
        if (!h2Table.equals("USER_ROLES")) {
            selectSql = "SELECT * FROM \"" + h2Table + "\" ORDER BY id ASC";
        } else {
            selectSql = "SELECT * FROM \"" + h2Table + "\" ORDER BY user_id ASC, role_id ASC";
        }

        long rowCount = 0;
        long maxId = 0;
        List<String> columns = new ArrayList<>();
        MessageDigest shaDigest = MessageDigest.getInstance("SHA-256");

        try (BufferedWriter writer = Files.newBufferedWriter(targetCsv, StandardCharsets.UTF_8);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(selectSql)) {

            ResultSetMetaData rsMeta = rs.getMetaData();
            int colCount = rsMeta.getColumnCount();
            for (int i = 1; i <= colCount; i++) {
                columns.add(rsMeta.getColumnName(i).toLowerCase());
            }

            // Header line
            String header = String.join(",", columns);
            writer.write(header);
            writer.write("\n");
            shaDigest.update(header.getBytes(StandardCharsets.UTF_8));
            shaDigest.update((byte) '\n');

            while (rs.next()) {
                rowCount++;
                StringBuilder line = new StringBuilder();
                for (int i = 1; i <= colCount; i++) {
                    if (i > 1) line.append(",");
                    Object val = rs.getObject(i);
                    if (val == null) {
                        // Empty string represents NULL in standard CSV import
                        line.append("");
                    } else {
                        String s = formatCsvValue(val);
                        line.append(s);
                    }
                }
                String lineStr = line.toString();
                writer.write(lineStr);
                writer.write("\n");
                shaDigest.update(lineStr.getBytes(StandardCharsets.UTF_8));
                shaDigest.update((byte) '\n');

                if (!h2Table.equals("USER_ROLES")) {
                    try {
                        long idVal = rs.getLong("id");
                        if (idVal > maxId) maxId = idVal;
                    } catch (Exception ignored) {}
                }
            }
        }

        byte[] hashBytes = shaDigest.digest();
        StringBuilder hexString = new StringBuilder();
        for (byte b : hashBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }

        return new ExportResult(rowCount, maxId, columns, hexString.toString());
    }

    private static String formatCsvValue(Object val) {
        if (val instanceof Boolean) {
            return ((Boolean) val) ? "TRUE" : "FALSE";
        }
        String str = val.toString();
        // Quoted empty string distinguishes literal "" from unquoted NULL in PostgreSQL CSV mode
        if (str.isEmpty()) {
            return "\"\"";
        }
        // Check if quoting is needed: contains comma, double quote, newline, carriage return, or leading/trailing space
        boolean needsQuotes = str.contains(",") || str.contains("\"") || str.contains("\n") || str.contains("\r")
                || str.startsWith(" ") || str.endsWith(" ");
        if (needsQuotes) {
            return "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return str;
    }

    private static void writePostgresImportScript(Path scriptPath, List<Map<String, Object>> manifestTables) throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("-- ============================================================\n");
        sb.append("-- LWR CONNECTING — MANAGED POSTGRESQL DATA IMPORT SCRIPT\n");
        sb.append("-- Execute inside psql connected to target PostgreSQL database:\n");
        sb.append("--   psql \"$DATABASE_URL\" -f import_postgres.sql\n");
        sb.append("-- ============================================================\n\n");
        sb.append("\\set ON_ERROR_STOP on\n\n");
        sb.append("BEGIN;\n\n");

        for (Map<String, Object> table : manifestTables) {
            String targetTable = (String) table.get("targetTable");
            String fileName = (String) table.get("fileName");
            List<?> cols = (List<?>) table.get("columns");
            String colList = String.join(", ", (List<String>) (List<?>) cols);

            sb.append(String.format(
                "\\copy %s (%s) FROM '%s' WITH (FORMAT csv, HEADER true, NULL '');\n",
                targetTable, colList, fileName
            ));
        }

        sb.append("\n-- Synchronize all identity sequences\n");
        sb.append("\\i sync_sequences.sql\n\n");
        sb.append("COMMIT;\n\n");
        sb.append("-- Import completed successfully.\n");

        Files.writeString(scriptPath, sb.toString(), StandardCharsets.UTF_8);
    }

    private static void writeManifestJson(Path manifestPath, List<Map<String, Object>> manifestTables, long totalRows, String sourceDb) throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"project\": \"LWR Connecting\",\n");
        sb.append("  \"purpose\": \"H2 to PostgreSQL Phase 3B Safe Migration Export\",\n");
        sb.append("  \"exportedAt\": \"").append(DateTimeFormatter.ISO_INSTANT.format(Instant.now())).append("\",\n");
        sb.append("  \"sourceDatabase\": \"").append(sourceDb.replace("\\", "/")).append(".mv.db\",\n");
        sb.append("  \"totalTablesExported\": ").append(manifestTables.size()).append(",\n");
        sb.append("  \"totalRowsExported\": ").append(totalRows).append(",\n");
        sb.append("  \"excludedLegacyPrototypeTables\": [\"users\", \"roles\", \"user_roles\", \"exams\", \"states\", \"subjects\"],\n");
        sb.append("  \"tables\": [\n");

        for (int i = 0; i < manifestTables.size(); i++) {
            Map<String, Object> t = manifestTables.get(i);
            sb.append("    {\n");
            sb.append("      \"importOrder\": ").append(t.get("importOrder")).append(",\n");
            sb.append("      \"targetTable\": \"").append(t.get("targetTable")).append("\",\n");
            sb.append("      \"sourceH2Table\": \"").append(t.get("sourceH2Table")).append("\",\n");
            sb.append("      \"fileName\": \"").append(t.get("fileName")).append("\",\n");
            sb.append("      \"rowCount\": ").append(t.get("rowCount")).append(",\n");
            sb.append("      \"maxId\": ").append(t.get("maxId")).append(",\n");
            sb.append("      \"hasIdSequence\": ").append(t.get("hasIdSequence")).append(",\n");
            sb.append("      \"columnCount\": ").append(t.get("columnCount")).append(",\n");
            sb.append("      \"sha256\": \"").append(t.get("sha256")).append("\",\n");
            sb.append("      \"columns\": [");
            List<?> cols = (List<?>) t.get("columns");
            for (int c = 0; c < cols.size(); c++) {
                if (c > 0) sb.append(", ");
                sb.append("\"").append(cols.get(c)).append("\"");
            }
            sb.append("]\n");
            sb.append("    }").append(i < manifestTables.size() - 1 ? "," : "").append("\n");
        }
        sb.append("  ]\n");
        sb.append("}\n");

        Files.writeString(manifestPath, sb.toString(), StandardCharsets.UTF_8);
    }

    private static class ExportResult {
        final long rowCount;
        final long maxId;
        final List<String> columns;
        final String sha256;

        ExportResult(long rowCount, long maxId, List<String> columns, String sha256) {
            this.rowCount = rowCount;
            this.maxId = maxId;
            this.columns = columns;
            this.sha256 = sha256;
        }
    }
}
