const localStorage = require("./local-storage");

const storageDriver = (process.env.STORAGE_DRIVER || "local").toLowerCase();

let storage = localStorage;

if (storageDriver === "supabase") {
  const supabaseStorage = require("./supabase-storage");
  storage = supabaseStorage;
}

module.exports = {
  ...storage,
  storageDriver
};
