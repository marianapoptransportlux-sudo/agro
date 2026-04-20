const test = require("node:test");
const assert = require("node:assert/strict");

const { withIsolatedWorkspace } = require("../test-support/isolated-runtime");

async function seedReceipt(storage) {
  return storage.createReceipt({
    supplier: "Agro Nord",
    supplierId: 1,
    product: "Grau",
    productId: 1,
    quantity: 100,
    grossQuantity: 100,
    unit: "tone",
    price: 3200,
    humidity: 14,
    impurity: 2,
    provisionalNetQuantity: 100,
    preliminaryPayableAmount: 320000,
    grossWeight: 25000,
    tareWeight: 5000,
    createdBy: "test"
  });
}

test("delivery state machine: Proiect -> Confirmat -> Livrat adjusts stock correctly", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage);

    const delivery = await storage.createDelivery({
      receiptId: receipt.id,
      customerId: 2,
      customer: "Export Grain",
      plannedQuantity: 30,
      contractPrice: 3500,
      createdBy: "operator"
    });

    assert.equal(delivery.status, "Proiect");

    let receipts = await storage.listReceipts();
    assert.equal(receipts[0].reservedQuantity, 0, "draft does not reserve stock");

    await storage.transitionDelivery(delivery.id, "confirm", {
      changeReason: "Confirmare comanda"
    });

    receipts = await storage.listReceipts();
    assert.equal(receipts[0].reservedQuantity, 30);
    assert.equal(receipts[0].availableQuantity, 70);

    const delivered = await storage.transitionDelivery(delivery.id, "deliver", {
      grossWeight: 35000,
      tareWeight: 5000,
      changeReason: "Cantarire la incarcare"
    });
    assert.equal(delivered.status, "Livrat");
    assert.equal(delivered.netWeight, 30000);

    receipts = await storage.listReceipts();
    assert.equal(receipts[0].deliveredQuantity, 30000);
  });
});

test("delivery deliver without weights rejects", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage);
    const delivery = await storage.createDelivery({
      receiptId: receipt.id,
      customerId: 2,
      customer: "Export Grain",
      plannedQuantity: 30,
      createdBy: "operator"
    });
    await storage.transitionDelivery(delivery.id, "confirm", { changeReason: "ok" });
    await assert.rejects(
      storage.transitionDelivery(delivery.id, "deliver", { changeReason: "ok" }),
      /Masa bruta reala/
    );
  });
});

test("close receipt blocks while open complaint exists", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage);

    await storage.updateReceiptStatus(receipt.id, "Procesata");

    const delivery = await storage.createDelivery({
      receiptId: receipt.id,
      customerId: 2,
      customer: "Export Grain",
      plannedQuantity: 10,
      createdBy: "operator"
    });
    await storage.transitionDelivery(delivery.id, "confirm", { changeReason: "ok" });
    await storage.transitionDelivery(delivery.id, "deliver", {
      grossWeight: 15000,
      tareWeight: 5000,
      changeReason: "cantarire"
    });

    await storage.createComplaint({
      deliveryId: delivery.id,
      complaintType: "umiditate",
      contestedQuantity: 2,
      createdBy: "accountant"
    });

    await assert.rejects(
      storage.closeReceipt(receipt.id, { changeReason: "close" }),
      /reclamatie deschisa/
    );

    const complaints = await storage.listComplaints();
    await storage.updateComplaint(complaints[0].id, {
      status: "Respinsa",
      changeReason: "nu se aplica",
      changedBy: "manager"
    });

    const closed = await storage.closeReceipt(receipt.id, { changeReason: "finalizat" });
    assert.equal(closed.status, "Inchis");
  });
});

test("overpayment registers advance in ledger", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage);

    const tx = await storage.createTransaction({
      referenceType: "receipt",
      receiptId: receipt.id,
      partnerId: 1,
      partner: "Agro Nord",
      direction: "payment",
      amount: 320000 + 50000,
      createdBy: "accountant"
    });

    assert.equal(tx.appliedAmount, 320000);
    assert.equal(tx.advanceAmount, 50000);
    assert.equal(tx.source, "overpayment");

    const advances = await storage.listPartnerAdvances(1);
    assert.equal(advances.length, 1);
    assert.equal(advances[0].remainingAmount, 50000);
  });
});

test("complaint stockCorrection rejects non-privileged role", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage);
    const delivery = await storage.createDelivery({
      receiptId: receipt.id,
      customerId: 2,
      customer: "Export Grain",
      plannedQuantity: 10,
      createdBy: "operator"
    });
    await storage.transitionDelivery(delivery.id, "confirm", { changeReason: "ok" });
    await storage.transitionDelivery(delivery.id, "deliver", {
      grossWeight: 15000,
      tareWeight: 5000,
      changeReason: "cantarire"
    });
    const complaint = await storage.createComplaint({
      deliveryId: delivery.id,
      complaintType: "lipsa",
      contestedQuantity: 500,
      createdBy: "accountant"
    });

    await assert.rejects(
      storage.updateComplaint(complaint.id, {
        status: "Acceptata",
        stockCorrection: { deliveryId: delivery.id, deltaQuantity: -500, note: "lipsa" },
        changeReason: "acceptare",
        changedBy: "contabil",
        currentUserRole: "accountant"
      }),
      /contabilul-sef/
    );

    const ok = await storage.updateComplaint(complaint.id, {
      status: "Acceptata",
      stockCorrection: { deliveryId: delivery.id, deltaQuantity: -500, note: "lipsa" },
      changeReason: "acceptare",
      changedBy: "contabil sef",
      currentUserRole: "accountant-sef"
    });
    assert.equal(ok.status, "Acceptata");
    const deliveries = await storage.listDeliveries();
    // netWeight = 15000 - 5000 = 10000, minus 500 correction = 9500
    assert.equal(deliveries[0].deliveredQuantity, 9500);
  });
});

test("migration backfills legacy Livrata -> Livrat and adds reservedQuantity", async () => {
  await withIsolatedWorkspace(async ({ tempWorkspace, load }) => {
    const fs = require("fs");
    const path = require("path");
    const runtimeDir = path.join(tempWorkspace, ".runtime-data");
    fs.mkdirSync(runtimeDir, { recursive: true });
    fs.writeFileSync(
      path.join(runtimeDir, "receipts.json"),
      JSON.stringify({
        openingDocuments: [],
        receipts: [
          {
            id: 1,
            supplier: "Old",
            supplierId: 1,
            product: "Grau",
            productId: 1,
            quantity: 100,
            provisionalNetQuantity: 100,
            deliveredQuantity: 20,
            status: "Procesata"
          }
        ],
        processings: [],
        transactions: [
          { id: 1, referenceType: "receipt", receiptId: 1, partnerId: 1, amount: 5000, direction: "payment", createdAt: "2026-01-01T00:00:00Z" }
        ],
        deliveries: [
          { id: 1, receiptId: 1, customerId: 2, status: "Livrata", deliveredQuantity: 20, createdAt: "2026-01-02T00:00:00Z" }
        ],
        complaints: [],
        auditLogs: [],
        lastId: 1
      }, null, 2)
    );

    const storage = load("src/local-storage.js");
    const deliveries = await storage.listDeliveries();
    assert.equal(deliveries[0].status, "Livrat");
    const receipts = await storage.listReceipts();
    assert.equal(receipts[0].reservedQuantity, 20);
    const tx = await storage.listTransactions();
    assert.equal(tx[0].appliedAmount, 5000);
    assert.equal(tx[0].advanceAmount, 0);
  });
});

test("password policy rejects short passwords on explicit creation", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const auth = load("src/auth.js");
    assert.throws(() => auth.validatePasswordPolicy("short1"), /minim 10/);
    assert.throws(() => auth.validatePasswordPolicy("noDigitsHere"), /litere si cifre/);
    assert.doesNotThrow(() => auth.validatePasswordPolicy("GoodPass12"));
    assert.doesNotThrow(() => auth.validatePasswordPolicy("short1", { lenient: true }));
  });
});
