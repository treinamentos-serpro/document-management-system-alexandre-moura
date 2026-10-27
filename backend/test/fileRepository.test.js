const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createFileRepository } = require('../src/repositories/fileRepository');

function createTempStorageDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'dms-files-'));
}

test('cria a pasta de armazenamento ao iniciar o repositório de arquivos', () => {
  const storageDir = path.join(createTempStorageDir(), 'nested');
  createFileRepository({ storageDir });

  assert.ok(fs.existsSync(storageDir));
});

test('resolve o caminho do arquivo dentro da pasta de armazenamento', () => {
  const storageDir = createTempStorageDir();
  const repository = createFileRepository({ storageDir });

  assert.strictEqual(repository.resolvePath('uuid-1'), path.join(storageDir, 'uuid-1'));
});

test('rejeita nomes de arquivo que escapam da pasta de armazenamento', () => {
  const repository = createFileRepository({ storageDir: createTempStorageDir() });

  for (const storedName of ['../fora.txt', '../../etc/passwd', '/etc/passwd', 'sub/../../fora']) {
    assert.throws(() => repository.resolvePath(storedName), /fora do armazenamento/, storedName);
  }
});
