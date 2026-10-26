const { test, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// O app cria o armazenamento ao ser carregado; isolamos em uma pasta temporária.
const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-app-'));
process.env.STORAGE_DIR = storageDir;
const app = require('../src/app');

after(() => fs.rmSync(storageDir, { recursive: true, force: true }));

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});
