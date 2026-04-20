const test = require("node:test");
const assert = require("node:assert/strict");

const { withIsolatedWorkspace } = require("../test-support/isolated-runtime");

test("createConfigEntry emits an audit entry on create", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");

    const before = await storage.listAuditLogs();
    const beforeCreateCount = before.filter(
      (item) => item.action === "config-create" && item.entityType === "partners"
    ).length;

    await storage.createConfigEntry("partners", {
      name: "Test Partner",
      idno: "111111111111",
      address: "Chisinau",
      phone: "+37360000100",
      role: "furnizor",
      fiscalProfile: "Persoana fizica",
      createdBy: "admin@test"
    });

    const after = await storage.listAuditLogs();
    const afterCreate = after.filter(
      (item) => item.action === "config-create" && item.entityType === "partners"
    );

    assert.equal(afterCreate.length, beforeCreateCount + 1);
    assert.equal(afterCreate[0].user, "admin@test");
    assert.match(afterCreate[0].reason, /partners/i);
  });
});

test("createConfigEntry rejects new user with password shorter than 8 characters", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");

    await assert.rejects(
      () =>
        storage.createConfigEntry("users", {
          name: "Weak Pass",
          username: "weakpass",
          roleCode: "operator",
          channel: "web",
          password: "short",
          createdBy: "admin@test"
        }),
      /minim 8 caractere/i
    );
  });
});

test("createConfigEntry accepts new user with password of 8+ characters", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");

    const user = await storage.createConfigEntry("users", {
      name: "Strong Pass",
      username: "strongpass",
      roleCode: "operator",
      channel: "web",
      password: "LongEnough1!",
      createdBy: "admin@test"
    });

    assert.equal(user.username, "strongpass");
    assert.ok(user.id > 0);
  });
});

test("updateConfigEntry rejects password change shorter than 8 characters", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const created = await storage.createConfigEntry("users", {
      name: "To Rotate",
      username: "rotate",
      roleCode: "operator",
      channel: "web",
      password: "OriginalPw1",
      createdBy: "admin@test"
    });

    await assert.rejects(
      () =>
        storage.updateConfigEntry("users", created.id, {
          password: "abc",
          changeReason: "test",
          changedBy: "admin@test"
        }),
      /minim 8 caractere/i
    );
  });
});
