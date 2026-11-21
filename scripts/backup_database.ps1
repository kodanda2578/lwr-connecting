# LWR Connecting - Database Safe Backup Script
# Creates a timestamped archive of the file-based H2 database into ./data/backups/

$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
Set-Location $workspaceRoot

$dataDir = Join-Path $workspaceRoot "data"
$dbFile = Join-Path $dataDir "lwr_db.mv.db"
$backupDir = Join-Path $dataDir "backups"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [LWR CONNECTING] Database Safe Backup Utility" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $dbFile)) {
    Write-Error "Database file not found at: $dbFile"
    exit 1
}

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archiveName = "lwr_db_backup_$timestamp.zip"
$targetArchive = Join-Path $backupDir $archiveName

$sourceSize = (Get-Item $dbFile).Length
Write-Host "Active Database: $dbFile ($sourceSize bytes)" -ForegroundColor Green

# Add System.IO.Compression.FileSystem assembly
Add-Type -AssemblyName System.IO.Compression.FileSystem

$tempStaging = Join-Path $dataDir "backup_staging_$timestamp"
New-Item -ItemType Directory -Path $tempStaging -Force | Out-Null

try {
    # Copy with file sharing allowed so live active connections are not locked
    $copyTarget = Join-Path $tempStaging "lwr_db.mv.db"
    [System.IO.File]::Copy($dbFile, $copyTarget, $true)

    # Compress staging file to target backup archive
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempStaging, $targetArchive)

    if (Test-Path $targetArchive) {
        $backupSize = (Get-Item $targetArchive).Length
        Write-Host "Backup Created Successfully!" -ForegroundColor Green
        Write-Host "  Archive Path: $targetArchive" -ForegroundColor White
        Write-Host "  Archive Size: $backupSize bytes" -ForegroundColor White
        Write-Host "  Status: READY FOR BETA RECOVERY" -ForegroundColor Green
    } else {
        throw "Failed to create archive at $targetArchive"
    }
} finally {
    if (Test-Path $tempStaging) {
        Remove-Item -Path $tempStaging -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan

