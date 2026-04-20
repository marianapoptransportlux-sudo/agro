const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");

const { writeJsonAtomic } = require("../src/atomic-write");

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "agro-atomic-"));
}

test("writeJsonAtomic writes JSON to the target path", () => {
  const dir = createTempDir();
  try {
    const target = path.join(dir, "config.json");
    writeJsonAtomic(target, { hello: "world", n: 42 });

    const parsed = JSON.parse(fs.readFileSync(target, "utf8"));
    assert.deepEqual(parsed, { hello: "world", n: 42 });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("writeJsonAtomic overwrites an existing file atomically", () => {
  const dir = createTempDir();
  try {
    const target = path.join(dir, "state.json");
    fs.writeFileSync(target, JSON.stringify({ old: true }), "utf8");
    writeJsonAtomic(target, { old: false, new: true });

    const parsed = JSON.parse(fs.readFileSync(target, "utf8"));
    assert.deepEqual(parsed, { old: false, new: true });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("writeJsonAtomic cleans up and leaves no .tmp file after success", () => {
  const dir = createTempDir();
  try {
    const target = path.join(dir, "auto.json");
    writeJsonAtomic(target, { run: 1 });
    writeJsonAtomic(target, { run: 2 });

    const entries = fs.readdirSync(dir);
    const stragglers = entries.filter((name) => name.includes(".tmp-"));
    assert.deepEqual(stragglers, [], "temporary files must be renamed away");
    assert.deepEqual(JSON.parse(fs.readFileSync(target, "utf8")), { run: 2 });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
