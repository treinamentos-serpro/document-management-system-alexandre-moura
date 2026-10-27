const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { loadConfig } = require('../src/config');

test('usa valores padrão quando as variáveis não existem', () => {
  const config = loadConfig({});

  assert.strictEqual(config.port, 3000);
  assert.strictEqual(config.maxFileSizeBytes, 10 * 1024 * 1024);
  assert.strictEqual(config.storageDir, path.resolve(__dirname, '..', 'storage'));
});

test('lê os valores das variáveis de ambiente', () => {
  const config = loadConfig({
    PORT: '8080',
    STORAGE_DIR: path.resolve('/tmp/dms'),
    MAX_FILE_SIZE_BYTES: '1024',
  });

  assert.strictEqual(config.port, 8080);
  assert.strictEqual(config.storageDir, path.resolve('/tmp/dms'));
  assert.strictEqual(config.maxFileSizeBytes, 1024);
});

test('rejeita PORT fora do intervalo válido', () => {
  for (const port of ['abc', '0', '-1', '1.5', '65536']) {
    assert.throws(() => loadConfig({ PORT: port }), /PORT inválido/, port);
  }
});

test('rejeita MAX_FILE_SIZE_BYTES que não seja inteiro positivo', () => {
  for (const size of ['abc', '0', '-1', '1.5']) {
    assert.throws(
      () => loadConfig({ MAX_FILE_SIZE_BYTES: size }),
      /MAX_FILE_SIZE_BYTES inválido/,
      size,
    );
  }
});
