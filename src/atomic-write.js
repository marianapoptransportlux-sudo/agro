const fs = require("fs");
const path = require("path");

function writeJsonAtomic(filePath, state) {
  const tmpPath = `${filePath}.tmp`;
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), "utf8");
  fs.renameSync(tmpPath, filePath);
}

module.exports = {
  writeJsonAtomic
};
