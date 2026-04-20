const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function readSource(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function extractEscapeHtml(source) {
  const match = source.match(
    /function escapeHtml\([\s\S]*?\n\}/
  );
  if (!match) {
    throw new Error("escapeHtml function not found in public/app.js");
  }
  return new Function(`${match[0]}; return escapeHtml;`)();
}

test("escapeHtml escapes common XSS payloads", () => {
  const escapeHtml = extractEscapeHtml(readSource("public/app.js"));

  assert.equal(
    escapeHtml("<script>alert(1)</script>"),
    "&lt;script&gt;alert(1)&lt;/script&gt;"
  );
  assert.equal(
    escapeHtml('<img src=x onerror="alert(1)">'),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"
  );
  assert.equal(escapeHtml("a & b"), "a &amp; b");
  assert.equal(escapeHtml("'single'"), "&#39;single&#39;");
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(undefined), "");
  assert.equal(escapeHtml(42), "42");
});

test("public/app.js uses escapeHtml on high-risk user-content fields", () => {
  const source = readSource("public/app.js");

  const mustEscape = [
    "escapeHtml(item.supplier)",
    "escapeHtml(item.customer)",
    "escapeHtml(item.product)",
    "escapeHtml(item.partner)",
    "escapeHtml(item.reason)",
    "escapeHtml(item.user"
  ];

  for (const fragment of mustEscape) {
    assert.ok(
      source.includes(fragment),
      `expected public/app.js to contain ${fragment}`
    );
  }
});

test("server sets strict security HTTP headers", () => {
  const source = readSource("src/server.js");

  assert.match(source, /X-Content-Type-Options.+nosniff/);
  assert.match(source, /X-Frame-Options.+DENY/);
  assert.match(source, /Referrer-Policy.+no-referrer/);
  assert.match(source, /Content-Security-Policy/);
  assert.match(source, /frame-ancestors 'none'/);
  assert.match(source, /object-src 'none'/);
  assert.ok(
    !/script-src[^;]*'unsafe-inline'/.test(source),
    "CSP should not include 'unsafe-inline' for scripts"
  );
});

test("session cookie is marked HttpOnly + SameSite=Strict", () => {
  const source = readSource("src/auth.js");
  assert.match(source, /HttpOnly/);
  assert.match(source, /SameSite=Strict/);
});

test("dead duplicate security module has been removed", () => {
  const deadPath = path.join(repoRoot, "src", "security.js");
  assert.equal(
    fs.existsSync(deadPath),
    false,
    "src/security.js should not exist (dead duplicate of auth.js)"
  );
});

test(".env and runtime data are gitignored", () => {
  const source = readSource(".gitignore");
  assert.match(source, /^\.env$/m);
  assert.match(source, /^\.runtime-data\/$/m);
});

test("env example does not contain real secrets", () => {
  const source = readSource(".env.example");
  const placeholderPattern = /(replace_me|your-project-ref)/i;
  assert.match(source, placeholderPattern);
  assert.ok(
    !/[A-Za-z0-9_-]{40,}/.test(source.replace(/replace_me/gi, "")),
    "env example should not contain long secret-like strings"
  );
});
