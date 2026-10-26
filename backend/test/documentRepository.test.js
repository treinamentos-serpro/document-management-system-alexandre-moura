const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createDocumentRepository } = require('../src/repositories/documentRepository');

function createTempStorageDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'dms-repo-'));
}

test('cria a pasta de armazenamento ao iniciar o repositório', () => {
  const storageDir = path.join(createTempStorageDir(), 'nested');
  createDocumentRepository({ storageDir });

  assert.ok(fs.existsSync(storageDir));
});

test('salva e busca documentos por id', () => {
  const repository = createDocumentRepository({ storageDir: createTempStorageDir() });
  const document = { id: 'doc-1', storedName: 'doc-1', owner: 'user-1' };

  repository.save(document);

  assert.deepStrictEqual(repository.findById('doc-1'), document);
  assert.strictEqual(repository.findById('inexistente'), null);
});

test('lista somente os documentos do dono informado', () => {
  const repository = createDocumentRepository({ storageDir: createTempStorageDir() });
  repository.save({ id: 'a', storedName: 'a', owner: 'user-1' });
  repository.save({ id: 'b', storedName: 'b', owner: 'user-2' });

  const ids = repository.listByOwner('user-1').map((document) => document.id);

  assert.deepStrictEqual(ids, ['a']);
});

test('resolve o caminho do arquivo dentro da pasta de armazenamento', () => {
  const storageDir = createTempStorageDir();
  const repository = createDocumentRepository({ storageDir });

  const filePath = repository.getFilePath({ storedName: 'uuid-1' });

  assert.strictEqual(filePath, path.join(storageDir, 'uuid-1'));
});
