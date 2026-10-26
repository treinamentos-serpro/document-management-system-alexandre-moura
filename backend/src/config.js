const path = require('node:path');

const DEFAULT_PORT = 3000;
const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const DEFAULT_STORAGE_DIR = path.resolve(__dirname, '..', 'storage');
const MAX_PORT = 65535;

function parseInteger(raw, defaultValue, name, max = Number.MAX_SAFE_INTEGER) {
  if (!raw) {
    return defaultValue;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0 || value > max) {
    throw new Error(`${name} inválido: "${raw}". Informe um inteiro entre 1 e ${max}.`);
  }
  return value;
}

function loadConfig(env = process.env) {
  return {
    port: parseInteger(env.PORT, DEFAULT_PORT, 'PORT', MAX_PORT),
    storageDir: env.STORAGE_DIR ? path.resolve(env.STORAGE_DIR) : DEFAULT_STORAGE_DIR,
    maxFileSizeBytes: parseInteger(
      env.MAX_FILE_SIZE_BYTES,
      DEFAULT_MAX_FILE_SIZE_BYTES,
      'MAX_FILE_SIZE_BYTES',
    ),
  };
}

module.exports = { loadConfig };
