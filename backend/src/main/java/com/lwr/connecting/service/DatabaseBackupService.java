package com.lwr.connecting.service;

import java.util.List;
import java.util.Map;

public interface DatabaseBackupService {
    Map<String, Object> createBackup();
    List<Map<String, Object>> listBackups();
    Map<String, Object> verifyBackup(String backupFileName);
}

