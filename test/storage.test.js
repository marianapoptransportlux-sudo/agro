const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const {
  withIsolatedWorkspace
} = require("../test-support/isolated-runtime");

test("local storage persists receipts and calculates stats", async () => {
  await withIsolatedWorkspace(async ({ tempWorkspace, load }) => {
    const storage = load("src/local-storage.js");

    const receipt = await storage.createReceipt({
      supplier: "Agro Nord",
      supplierId: 1,
      product: "Grau",
      productId: 1,
      quantity: 12.5,
      grossQuantity: 12.5,
      unit: "tone",
      price: 3200,
      humidity: 16,
      impurity: 3,
      provisionalNetQuantity: 11.7,
      preliminaryPayableAmount: 37440,
      createdBy: "test"
    });

    assert.equal(receipt.id, 1);
    assert.equal(receipt.product, "Grau");

    const receipts = await storage.listReceipts();
    assert.equal(receipts.length, 1);
    assert.equal(receipts[0].supplier, "Agro Nord");

    const stats = await storage.getStats();
    assert.equal(stats.totalReceipts, 1);
    assert.equal(stats.totalQuantity, 12.5);
    assert.equal(stats.totalValue, 37440);

    const persistedReceiptsPath = path.join(tempWorkspace, ".runtime-data", "receipts.json");
    const persistedState = JSON.parse(fs.readFileSync(persistedReceiptsPath, "utf8"));
    assert.equal(persistedState.receipts.length, 1);
    assert.equal(persistedState.auditLogs.length, 1);
  });
});
