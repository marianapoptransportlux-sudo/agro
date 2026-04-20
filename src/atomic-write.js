const fs = require("fs");
const path = require("path");

function writeJsonAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const tempName = `.${base}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const tempPath = path.join(dir, tempName);

  const serialized = JSON.stringify(data, null, 2);

  const fd = fs.openSync(tempPath, "w");
  try {
    fs.writeFileSync(fd, serialized, "utf8");
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }

  fs.renameSync(tempPath, filePath);
}

module.exports = { writeJsonAtomic };
