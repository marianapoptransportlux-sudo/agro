const fs = require("fs");
const path = require("path");

const runtimeDataDir = path.join(process.cwd(), ".runtime-data");
const runtimeBackupsDir = path.join(process.cwd(), ".runtime-data-backups");
const maxBackupVersions = 7;
const backupBurstWindowMs = 250;

let lastBackupAt = 0;

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createBackupVersionName(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function listBackupVersions() {
  if (!fs.existsSync(runtimeBackupsDir)) {
    return [];
  }

  return fs
    .readdirSync(runtimeBackupsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const fullPath = path.join(runtimeBackupsDir, entry.name);
      const stats = fs.statSync(fullPath);
      return {
        name: entry.name,
        fullPath,
        mtimeMs: stats.mtimeMs
      };
    })
    .sort((left, right) => right.mtimeMs - left.mtimeMs);
}

function getBackupVersion(versionName) {
  return listBackupVersions().find((item) => item.name === versionName) || null;
}

function pruneOldBackups() {
  const versions = listBackupVersions();

  for (const version of versions.slice(maxBackupVersions)) {
    fs.rmSync(version.fullPath, { recursive: true, force: true });
  }
}

function backupRuntimeData(options = {}) {
  const force = options.force === true;
  const suffix = String(options.suffix || "").trim();
  const now = Date.now();
  if (!force && now - lastBackupAt < backupBurstWindowMs) {
    return null;
  }

  if (!fs.existsSync(runtimeDataDir)) {
    return null;
  }

  const entries = fs.readdirSync(runtimeDataDir);
  if (!entries.length) {
    return null;
  }

  ensureDirectory(runtimeBackupsDir);

  const baseVersionName = suffix
    ? `${createBackupVersionName()}-${suffix}`
    : createBackupVersionName();
  let versionName = baseVersionName;
  let versionPath = path.join(runtimeBackupsDir, versionName);
  let counter = 1;

  while (fs.existsSync(versionPath)) {
    counter += 1;
    versionName = `${baseVersionName}-${counter}`;
    versionPath = path.join(runtimeBackupsDir, versionName);
  }

  fs.cpSync(runtimeDataDir, versionPath, { recursive: true });
  lastBackupAt = now;
  pruneOldBackups();

  return versionPath;
}

function restoreRuntimeData(versionName) {
  const normalizedVersionName = String(versionName || "").trim();
  if (!normalizedVersionName) {
    throw new Error("Versiunea backup este obligatorie.");
  }

  const backupVersion = getBackupVersion(normalizedVersionName);
  if (!backupVersion) {
    throw new Error(`Backup inexistent: ${normalizedVersionName}`);
  }

  const safetyBackupPath = backupRuntimeData({
    force: true,
    suffix: "pre-restore"
  });

  fs.rmSync(runtimeDataDir, { recursive: true, force: true });
  ensureDirectory(path.dirname(runtimeDataDir));
  fs.cpSync(backupVersion.fullPath, runtimeDataDir, { recursive: true });

  return {
    restoredFrom: backupVersion.fullPath,
    safetyBackupPath
  };
}

module.exports = {
  backupRuntimeData,
  getBackupVersion,
  listBackupVersions,
  restoreRuntimeData,
  runtimeBackupsDir
};
