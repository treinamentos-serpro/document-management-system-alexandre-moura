const { test } = require('node:test');
const assert = require('node:assert');
const { createDocumentRepository } = require('../src/repositories/documentRepository');

test('salva e busca documentos por id', () => {
  const repository = createDocumentRepository();
  const document = { id: 'doc-1', storedName: 'doc-1', owner: 'user-1' };

  repository.save(document);

  assert.deepStrictEqual(repository.findById('doc-1'), document);
  assert.strictEqual(repository.findById('inexistente'), null);
});

test('lista somente os documentos do dono informado', () => {
  const repository = createDocumentRepository();
  repository.save({ id: 'a', storedName: 'a', owner: 'user-1' });
  repository.save({ id: 'b', storedName: 'b', owner: 'user-2' });

  const ids = repository.listByOwner('user-1').map((document) => document.id);

  assert.deepStrictEqual(ids, ['a']);
});

test('não permite que alterações externas mudem os metadados armazenados', () => {
  const repository = createDocumentRepository();
  repository.save({ id: 'doc-1', owner: 'user-1', originalName: 'original.pdf' });

  repository.findById('doc-1').originalName = 'alterado.pdf';
  repository.listByOwner('user-1')[0].owner = 'user-2';

  assert.strictEqual(repository.findById('doc-1').originalName, 'original.pdf');
  assert.strictEqual(repository.findById('doc-1').owner, 'user-1');
});
