const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { withIsolatedWorkspace } = require("../test-support/isolated-runtime");

async function seedReceipt(storage, overrides = {}) {
  return storage.createReceipt({
    supplier: "Agro Nord",
    supplierId: 1,
    product: "Grau",
    productId: 1,
    quantity: 100,
    grossQuantity: 100,
    unit: "tone",
    price: 3000,
    humidity: 14,
    impurity: 2,
    provisionalNetQuantity: 100,
    finalNetQuantity: 100,
    preliminaryPayableAmount: 300000,
    createdBy: "test",
    ...overrides
  });
}

test("A#3 validatePasswordPolicy blocks weak passwords and allows strong", () => {
  const { validatePasswordPolicy } = require("../src/auth");

  assert.throws(() => validatePasswordPolicy("prea"), /minim 10/);
  assert.throws(() => validatePasswordPolicy("doarliterespatiu"), /litera si o cifra/);
  assert.throws(() => validatePasswordPolicy("Agro2026!"), /prea comuna/);
  assert.doesNotThrow(() => validatePasswordPolicy("Noua2026Secure"));
  assert.doesNotThrow(() => validatePasswordPolicy("scurt6", { mode: "lenient" }));
});

test("A#6 maskSensitiveFields masks passwords in audit entries", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");

    const entry = await storage.appendAuditLog({
      entityType: "users",
      entityId: 2,
      action: "test-mask",
      reason: "verificare mascare",
      user: "test",
      newValue: { username: "demo", passwordHash: "real-hash", passwordSalt: "real-salt", token: "abc" }
    });

    assert.equal(entry.newValue.passwordHash, "***");
    assert.equal(entry.newValue.passwordSalt, "***");
    assert.equal(entry.newValue.token, "***");
    assert.equal(entry.newValue.username, "demo");
  });
});

test("A#2 createConfigEntry emits audit with changeReason", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");

    const entry = await storage.createConfigEntry("partners", {
      name: "Partener Test",
      idno: "999",
      address: "Adresa",
      phone: "+37370000000",
      role: "furnizor",
      fiscalProfile: "Persoana fizica",
      changeReason: "adaugare partener test",
      changedBy: "admin-test"
    });
    assert.equal(entry.name, "Partener Test");

    const logs = await storage.listAuditLogs();
    const createLog = logs.find((item) => item.action === "config-create" && item.entityType === "partners");
    assert.ok(createLog, "audit entry config-create should exist");
    assert.equal(createLog.reason, "adaugare partener test");
    assert.equal(createLog.user, "admin-test");
  });
});

test("A#2 createConfigEntry fara changeReason intoarce eroare", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    await assert.rejects(
      storage.createConfigEntry("partners", {
        name: "Partener Fara Reason",
        role: "furnizor",
        fiscalProfile: "Persoana fizica"
      }),
      /Mentiunea modificarii/
    );
  });
});

test("Q1 delivery state machine: create -> confirm -> deliver with weights", async () => {
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
    assert.equal(delivery.status, "Proiect");
    assert.equal(delivery.deliveredQuantity, 0);

    const confirmed = await storage.transitionDelivery(delivery.id, "Confirmat", {
      changeReason: "confirmare test",
      currentUser: { name: "Operator Test", roleCode: "operator" }
    });
    assert.equal(confirmed.status, "Confirmat");

    const receipts1 = await storage.listReceipts();
    const receipt1 = receipts1.find((r) => r.id === receipt.id);
    assert.equal(receipt1.reservedQuantity, 30);
    assert.equal(receipt1.availableQuantity, 70);
    assert.equal(receipt1.deliveryStatus, "Rezervat partial");

    await assert.rejects(
      storage.transitionDelivery(delivery.id, "Livrat", {
        changeReason: "fara cantar",
        currentUser: { name: "Op" }
      }),
      /grossWeight/
    );

    const delivered = await storage.transitionDelivery(delivery.id, "Livrat", {
      grossWeight: 30000,
      tareWeight: 3000,
      changeReason: "cantarit",
      currentUser: { name: "Op" }
    });
    assert.equal(delivered.status, "Livrat");
    assert.equal(delivered.netWeight, 27000);
    assert.equal(delivered.deliveredQuantity, 27000);
  });
});

test("Q1 transitionDelivery refuza tranzitie invalida", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage);
    const delivery = await storage.createDelivery({
      receiptId: receipt.id,
      customerId: 2,
      customer: "Export Grain",
      plannedQuantity: 10,
      createdBy: "op"
    });
    await assert.rejects(
      storage.transitionDelivery(delivery.id, "Livrat", {
        grossWeight: 1000,
        tareWeight: 100,
        changeReason: "skip confirm",
        currentUser: {}
      }),
      /Tranzitie invalida/
    );
  });
});

test("Q2 closeReceipt blochează cu reclamație deschisă, permite după acceptare", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage, { status: "Procesata" });
    const delivery = await storage.createDelivery({
      receiptId: receipt.id,
      customerId: 2,
      customer: "Export Grain",
      plannedQuantity: 5,
      createdBy: "op"
    });
    await storage.transitionDelivery(delivery.id, "Confirmat", {
      changeReason: "c",
      currentUser: {}
    });
    await storage.transitionDelivery(delivery.id, "Livrat", {
      grossWeight: 5000,
      tareWeight: 0,
      changeReason: "l",
      currentUser: {}
    });

    const complaint = await storage.createComplaint({
      deliveryId: delivery.id,
      complaintType: "Calitate",
      contestedQuantity: 1,
      createdBy: "accountant-sef"
    });

    await assert.rejects(
      storage.closeReceipt(receipt.id, { changeReason: "inchidere", changedBy: "manager" }),
      /reclamatie|Reclamatie/i
    );

    await storage.updateComplaint(complaint.id, {
      status: "Acceptata",
      changeReason: "rezolvat",
      currentUser: { name: "Șef", roleCode: "accountant-sef" }
    });

    const closed = await storage.closeReceipt(receipt.id, {
      changeReason: "inchidere dupa rezolvare",
      changedBy: "manager"
    });
    assert.equal(closed.status, "Inchis");

    await assert.rejects(
      storage.createDelivery({
        receiptId: receipt.id,
        customerId: 2,
        customer: "Export Grain",
        plannedQuantity: 1,
        createdBy: "op"
      }),
      /inchisa/i
    );

    const reopened = await storage.reopenReceipt(receipt.id, {
      changeReason: "redeschidere test",
      changedBy: "admin"
    });
    assert.equal(reopened.status, "Redeschis");
  });
});

test("Q3 supra-plata creeaza avans si applyAdvance consuma FIFO", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage, { preliminaryPayableAmount: 1000 });

    const tx = await storage.createTransaction({
      referenceType: "receipt",
      receiptId: receipt.id,
      partnerId: 1,
      partner: "Agro Nord",
      direction: "payment",
      amount: 1500,
      createdBy: "contabil"
    });
    assert.equal(tx.appliedAmount, 1000);
    assert.equal(tx.advanceAmount, 500);

    const advances = await storage.listPartnerAdvances();
    assert.equal(advances.length, 1);
    assert.equal(advances[0].remainingAmount, 500);

    const receipt2 = await seedReceipt(storage, { preliminaryPayableAmount: 300 });
    const result = await storage.applyAdvanceCredit({
      partnerId: 1,
      targetReceiptId: receipt2.id,
      amount: 300,
      createdBy: "contabil",
      currentUser: { name: "Contabil" }
    });
    assert.equal(result.transaction.appliedAmount, 300);
    assert.equal(result.transaction.source, "advance-applied");

    const advances2 = await storage.listPartnerAdvances();
    assert.equal(advances2[0].remainingAmount, 200);
  });
});

test("Q3 applyAdvance refuza daca avans insuficient", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage, { preliminaryPayableAmount: 500 });
    await assert.rejects(
      storage.applyAdvanceCredit({
        partnerId: 1,
        targetReceiptId: receipt.id,
        amount: 100,
        currentUser: {}
      }),
      /insuficient/i
    );
  });
});

test("Q4 complaint stockCorrection blocat pentru accountant, permis pentru accountant-sef", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage);
    const delivery = await storage.createDelivery({
      receiptId: receipt.id,
      customerId: 2,
      customer: "Export Grain",
      plannedQuantity: 10,
      createdBy: "op"
    });
    await storage.transitionDelivery(delivery.id, "Confirmat", { changeReason: "c", currentUser: {} });
    await storage.transitionDelivery(delivery.id, "Livrat", {
      grossWeight: 10000,
      tareWeight: 0,
      changeReason: "l",
      currentUser: {}
    });
    const complaint = await storage.createComplaint({
      deliveryId: delivery.id,
      complaintType: "Lipsa cantitate",
      contestedQuantity: 500,
      createdBy: "op"
    });

    await assert.rejects(
      storage.updateComplaint(complaint.id, {
        status: "Acceptata",
        stockCorrection: { deliveryId: delivery.id, deltaQuantity: -500, note: "lipsa" },
        changeReason: "ajustare",
        currentUser: { name: "Contabil", roleCode: "accountant" }
      }),
      /drepturi pentru corectie de stoc/i
    );

    const updated = await storage.updateComplaint(complaint.id, {
      status: "Acceptata",
      stockCorrection: { deliveryId: delivery.id, deltaQuantity: -500, note: "lipsa" },
      changeReason: "ajustare stoc",
      currentUser: { name: "Șef Contabil", roleCode: "accountant-sef" }
    });
    assert.equal(updated.status, "Acceptata");
    assert.equal(updated.stockCorrection.deltaQuantity, -500);

    const deliveries = await storage.listDeliveries();
    const current = deliveries.find((d) => d.id === delivery.id);
    assert.equal(current.deliveredQuantity, 9500);
  });
});

test("Q4 complaint invoiceAdjustment creeaza tranzactie compensatorie", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const receipt = await seedReceipt(storage);
    const delivery = await storage.createDelivery({
      receiptId: receipt.id,
      customerId: 2,
      customer: "Export Grain",
      plannedQuantity: 5,
      createdBy: "op"
    });
    await storage.transitionDelivery(delivery.id, "Confirmat", { changeReason: "c", currentUser: {} });
    await storage.transitionDelivery(delivery.id, "Livrat", {
      grossWeight: 5000,
      tareWeight: 0,
      changeReason: "l",
      currentUser: {}
    });
    const complaint = await storage.createComplaint({
      deliveryId: delivery.id,
      complaintType: "Pret",
      contestedQuantity: 0,
      createdBy: "op"
    });

    const updated = await storage.updateComplaint(complaint.id, {
      status: "Acceptata",
      invoiceAdjustment: { type: "adjust", amount: -200, note: "reducere pret" },
      changeReason: "ajustare factura",
      currentUser: { name: "Contabil", roleCode: "accountant" }
    });
    assert.equal(updated.invoiceAdjustment.amount, -200);
    assert.ok(updated.invoiceAdjustment.compensatoryTransactionId);

    const txs = await storage.listTransactions();
    const compensatory = txs.find((item) => item.source === "complaint-adjustment");
    assert.ok(compensatory, "tranzactie compensatorie nu exista");
    assert.equal(compensatory.amount, -200);
  });
});

test("A#1 atomic writes: writeJsonAtomic creeaza .tmp apoi rename", async () => {
  await withIsolatedWorkspace(async ({ tempWorkspace, load }) => {
    const { writeJsonAtomic } = require("../src/atomic-write");
    const target = path.join(tempWorkspace, "test.json");
    writeJsonAtomic(target, { hello: "world" });
    assert.ok(fs.existsSync(target));
    assert.equal(fs.existsSync(`${target}.tmp`), false);
    assert.deepEqual(JSON.parse(fs.readFileSync(target, "utf8")), { hello: "world" });
  });
});

test("A#5 requirePasswordChange: user seed necesita schimbare, dupa change-password = false", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const user = await storage.findUserByUsername("admin");
    assert.equal(user.requirePasswordChange, true);

    await storage.updateUserPasswordById(user.id, "NoiParole2026");
    const after = await storage.findUserByUsername("admin");
    assert.equal(after.requirePasswordChange, false);
  });
});

test("runMigrationIfNeeded ruleaza o singura data (idempotent)", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const first = storage.runMigrationIfNeeded();
    assert.equal(first.migrated, true);
    const second = storage.runMigrationIfNeeded();
    assert.equal(second.migrated, false);
    assert.equal(second.version, first.version);
  });
});
