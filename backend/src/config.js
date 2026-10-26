const path = require('node:path');

const DEFAULT_PORT = 3000;
const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const DEFAULT_STORAGE_DIR = path.resolve(__dirname, '..', 'storage');

function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT) || DEFAULT_PORT,
    storageDir: env.STORAGE_DIR ? path.resolve(env.STORAGE_DIR) : DEFAULT_STORAGE_DIR,
    maxFileSizeBytes: Number(env.MAX_FILE_SIZE_BYTES) || DEFAULT_MAX_FILE_SIZE_BYTES,
  };
}

module.exports = { loadConfig };
