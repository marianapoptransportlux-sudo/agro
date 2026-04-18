const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const {
  withIsolatedWorkspace
} = require("../test-support/isolated-runtime");

test("runtime backup restores data and keeps safety snapshot", async () => {
  await withIsolatedWorkspace(async ({ tempWorkspace, load }) => {
    const storage = load("src/local-storage.js");
    const backup = load("src/runtime-backup.js");

    await storage.createReceipt({
      supplier: "Agro Nord",
      product: "Grau",
      quantity: 10,
      grossQuantity: 10,
      unit: "tone",
      price: 3000,
      provisionalNetQuantity: 9.6,
      preliminaryPayableAmount: 28800,
      createdBy: "test"
    });

    const firstBackupPath = backup.backupRuntimeData({ force: true, suffix: "baseline" });
    assert.ok(firstBackupPath);

    const receiptsFile = path.join(tempWorkspace, ".runtime-data", "receipts.json");
    const modifiedState = JSON.parse(fs.readFileSync(receiptsFile, "utf8"));
    modifiedState.receipts = [];
    fs.writeFileSync(receiptsFile, JSON.stringify(modifiedState, null, 2), "utf8");

    const restored = backup.restoreRuntimeData(path.basename(firstBackupPath));
    assert.ok(restored.safetyBackupPath);

    const restoredState = JSON.parse(fs.readFileSync(receiptsFile, "utf8"));
    assert.equal(restoredState.receipts.length, 1);

    const versions = backup.listBackupVersions();
    assert.ok(versions.length >= 2);
    assert.ok(versions.some((item) => item.name.includes("baseline")));
    assert.ok(versions.some((item) => item.name.includes("pre-restore")));
  });
});

test("runtime backup keeps only the latest 7 versions", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const backup = load("src/runtime-backup.js");

    await storage.createReceipt({
      supplier: "Agro Nord",
      product: "Porumb",
      quantity: 8,
      grossQuantity: 8,
      unit: "tone",
      price: 2500,
      provisionalNetQuantity: 7.8,
      preliminaryPayableAmount: 19500,
      createdBy: "test"
    });

    for (let index = 0; index < 8; index += 1) {
      backup.backupRuntimeData({
        force: true,
        suffix: `version-${index + 1}`
      });
    }

    const versions = backup.listBackupVersions();
    assert.equal(versions.length, 7);
    assert.ok(!versions.some((item) => item.name.includes("version-1")));
    assert.ok(versions.some((item) => item.name.includes("version-8")));
  });
});
