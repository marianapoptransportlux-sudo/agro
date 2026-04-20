const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createMockResponse,
  withIsolatedWorkspace
} = require("../test-support/isolated-runtime");

test("default workspace exposes bootstrap admin and fixed v1 roles", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const storage = load("src/local-storage.js");
    const auth = load("src/auth.js");

    const config = await storage.getConfig();
    assert.equal(config.users.length, 1);
    assert.equal(config.users[0].username, "admin");
    assert.equal(config.users[0].roleCode, "admin");
    assert.deepEqual(
      config.roles.map((item) => item.code),
      ["operator", "manager", "accountant", "admin", "control", "accountant-sef"]
    );

    const sessionUser = auth.sanitizeUserForSession(config.users[0]);
    assert.ok(sessionUser.permissions.includes("setup"));
    assert.ok(sessionUser.permissions.includes("security-admin"));
  });
});

test("user handlers create, list and update persistent users", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const {
      createUserHandler,
      listUsersHandler,
      updateUserHandler
    } = load("src/user-handlers.js");

    const createReq = {
      body: {
        name: "Operator Linia 1",
        username: "operator.linia1",
        roleCode: "operator",
        channel: "web",
        active: true,
        password: "ParolaTemporara123"
      }
    };
    const createRes = createMockResponse();
    await createUserHandler(createReq, createRes);

    assert.equal(createRes.statusCode, 201);
    assert.equal(createRes.body.username, "operator.linia1");
    assert.equal(createRes.body.roleCode, "operator");

    const updateReq = {
      body: {
        name: "Operator Linia 1",
        username: "operator.linia1",
        roleCode: "manager",
        channel: "web+telegram",
        active: false,
        changeReason: "Promovare si suspendare temporara"
      },
      currentUser: {
        id: 1,
        name: "Administrator",
        username: "admin",
        roleCode: "admin"
      }
    };
    const updateRes = createMockResponse();
    await updateUserHandler(updateReq, updateRes, createRes.body.id);

    assert.equal(updateRes.statusCode, 200);
    assert.equal(updateRes.body.roleCode, "manager");
    assert.equal(updateRes.body.active, false);
    assert.ok(updateRes.body.permissions.includes("reports"));

    const listRes = createMockResponse();
    await listUsersHandler({}, listRes);

    assert.equal(listRes.statusCode, 200);
    assert.equal(listRes.body.users.length, 2);
    assert.ok(listRes.body.users.some((item) => item.username === "operator.linia1"));
  });
});

test("cannot deactivate or demote the last active administrator", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const { updateUserHandler } = load("src/user-handlers.js");

    const updateReq = {
      body: {
        name: "Administrator",
        username: "admin",
        roleCode: "manager",
        channel: "web",
        active: false,
        changeReason: "Test invalid"
      },
      currentUser: {
        id: 1,
        name: "Administrator",
        username: "admin",
        roleCode: "admin"
      }
    };
    const updateRes = createMockResponse();
    await updateUserHandler(updateReq, updateRes, 1);

    assert.equal(updateRes.statusCode, 400);
    assert.equal(updateRes.body.error, "Trebuie sa ramana cel putin un administrator activ.");
  });
});
