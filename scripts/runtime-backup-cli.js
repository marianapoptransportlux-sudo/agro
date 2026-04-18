const {
  listBackupVersions,
  restoreRuntimeData
} = require("../src/runtime-backup");

function printUsage() {
  console.log("Usage:");
  console.log("  npm run backups:list");
  console.log("  npm run backups:restore -- <backup-version>");
}

function formatDate(value) {
  return new Date(value).toLocaleString("ro-RO", {
    hour12: false
  });
}

function listCommand() {
  const versions = listBackupVersions();

  if (!versions.length) {
    console.log("Nu exista backup-uri disponibile.");
    return;
  }

  console.log("Backup-uri disponibile:");
  versions.forEach((version, index) => {
    console.log(
      `${index + 1}. ${version.name} | ${formatDate(version.mtimeMs)} | ${version.fullPath}`
    );
  });
}

function restoreCommand(versionName) {
  const result = restoreRuntimeData(versionName);
  console.log(`Restaurat din: ${result.restoredFrom}`);

  if (result.safetyBackupPath) {
    console.log(`Backup de siguranta creat: ${result.safetyBackupPath}`);
  }
}

function main() {
  const [command, ...rest] = process.argv.slice(2);

  try {
    if (command === "list") {
      listCommand();
      return;
    }

    if (command === "restore") {
      const versionName = rest[0];
      if (!versionName) {
        printUsage();
        process.exitCode = 1;
        return;
      }

      restoreCommand(versionName);
      return;
    }

    printUsage();
    process.exitCode = 1;
  } catch (error) {
    console.error(error.message || "Comanda de backup a esuat.");
    process.exitCode = 1;
  }
}

main();
