const test = require("node:test");
const assert = require("node:assert/strict");

const { withIsolatedWorkspace } = require("../test-support/isolated-runtime");

async function seedReceipt(storage) {
  return storage.createReceipt({
    supplier: "Agro Nord",
    supplierId: 1,
    product: "Grau",
    productId: 1,
    quantity: 10,
    grossQuantity: 10,
    unit: "tone",
    price: 3000,
    provisionalNetQuantity: 10,
    createdBy: "test"
  });
}

test("createProcessing rejects waste greater than source quantity", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage);

    await assert.rejects(
      () =>
        storage.createProcessing({
          receiptId: receipt.id,
          product: receipt.product,
          processingType: "Curatire",
          processedQuantity: 9,
          confirmedWaste: 11,
          createdBy: "test"
        }),
      /rebut/i
    );
  });
});

test("createProcessing rejects processedQuantity + waste exceeding source", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage);

    await assert.rejects(
      () =>
        storage.createProcessing({
          receiptId: receipt.id,
          product: receipt.product,
          processingType: "Curatire",
          processedQuantity: 9,
          confirmedWaste: 2,
          createdBy: "test"
        }),
      /depasesc/i
    );
  });
});

test("createProcessing rejects missing source receipt", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    await assert.rejects(
      () =>
        storage.createProcessing({
          receiptId: 9999,
          product: "Grau",
          processingType: "Curatire",
          processedQuantity: 1,
          confirmedWaste: 0,
          createdBy: "test"
        }),
      /nu exista/i
    );
  });
});

test("createProcessing accepts valid waste within source quantity", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage);

    const processing = await storage.createProcessing({
      receiptId: receipt.id,
      product: receipt.product,
      processingType: "Curatire",
      processedQuantity: 8,
      confirmedWaste: 1,
      finalNetQuantity: 8,
      createdBy: "test"
    });

    assert.equal(processing.confirmedWaste, 1);
    assert.equal(processing.processedQuantity, 8);
  });
});
