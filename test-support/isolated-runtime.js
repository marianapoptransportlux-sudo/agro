const fs = require("fs");
const os = require("os");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

const modulePathsToReset = [
  "src/auth.js",
  "src/runtime-backup.js",
  "src/local-storage.js",
  "src/storage.js",
  "src/auth-handlers.js"
];

function clearModuleCache() {
  for (const relativePath of modulePathsToReset) {
    const absolutePath = path.join(repoRoot, relativePath);
    delete require.cache[require.resolve(absolutePath)];
  }
}

function createTempWorkspace() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "agro-tests-"));
}

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(payload) {
      this.body = payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

function withIsolatedWorkspace(run) {
  const originalCwd = process.cwd();
  const tempWorkspace = createTempWorkspace();

  process.chdir(tempWorkspace);
  clearModuleCache();

  return Promise.resolve()
    .then(() => run({
      tempWorkspace,
      load(relativePath) {
        const absolutePath = path.join(repoRoot, relativePath);
        delete require.cache[require.resolve(absolutePath)];
        return require(absolutePath);
      }
    }))
    .finally(() => {
      process.chdir(originalCwd);
      clearModuleCache();
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    });
}

module.exports = {
  createMockResponse,
  withIsolatedWorkspace
};
