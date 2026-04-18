const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createMockResponse,
  withIsolatedWorkspace
} = require("../test-support/isolated-runtime");

test("login handler authenticates valid default user and sets session cookie", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const { loginHandler } = load("src/auth-handlers.js");

    const req = {
      body: {
        username: "admin",
        password: "Agro2026!"
      },
      headers: {},
      socket: {
        remoteAddress: "127.0.0.1"
      },
      secure: false
    };
    const res = createMockResponse();

    await loginHandler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.user.username, "admin");
    assert.match(String(res.headers["Set-Cookie"] || ""), /agro_session=/);
  });
});

test("login handler rejects invalid password", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const { loginHandler } = load("src/auth-handlers.js");

    const req = {
      body: {
        username: "admin",
        password: "gresit"
      },
      headers: {},
      socket: {
        remoteAddress: "127.0.0.1"
      },
      secure: false
    };
    const res = createMockResponse();

    await loginHandler(req, res);

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error, "Date de autentificare invalide.");
  });
});
