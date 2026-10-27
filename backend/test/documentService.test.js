const { test } = require('node:test');
const assert = require('node:assert');
const {
  createDocumentService,
  DocumentNotFoundError,
} = require('../src/services/documentService');

function createFakeRepository() {
  const documents = new Map();
  return {
    save(document) {
      documents.set(document.id, document);
      return document;
    },
    findById(id) {
      return documents.get(id) ?? null;
    },
    listByOwner(owner) {
      return [...documents.values()].filter((document) => document.owner === owner);
    },
  };
}

function createFakeFileRepository() {
  return {
    resolvePath(storedName) {
      return `/fake/${storedName}`;
    },
  };
}

function createService(options = {}) {
  return createDocumentService({
    documentRepository: createFakeRepository(),
    fileRepository: createFakeFileRepository(),
    ...options,
  });
}

function createUpload(overrides = {}) {
  return {
    storedName: 'uuid-1',
    originalName: 'contrato.pdf',
    mimeType: 'application/pdf',
    size: 10,
    owner: 'user-1',
    ...overrides,
  };
}

test('cria documento com id igual ao nome em disco e data de envio', () => {
  const service = createService({ clock: () => new Date('2026-10-26T14:30:00.000Z') });

  const document = service.createDocument(createUpload());

  assert.strictEqual(document.id, 'uuid-1');
  assert.strictEqual(document.storedName, 'uuid-1');
  assert.strictEqual(document.uploadedAt, '2026-10-26T14:30:00.000Z');
});

test('lista somente os documentos do dono do mais recente ao mais antigo', () => {
  let current = Date.parse('2026-10-26T10:00:00.000Z');
  const service = createService({ clock: () => new Date((current += 1000)) });
  service.createDocument(createUpload({ storedName: 'antigo' }));
  service.createDocument(createUpload({ storedName: 'outro', owner: 'user-2' }));
  service.createDocument(createUpload({ storedName: 'recente' }));

  const ids = service.listDocumentsByOwner('user-1').map((document) => document.id);

  assert.deepStrictEqual(ids, ['recente', 'antigo']);
});

test('permite baixar somente ao dono do documento', () => {
  const service = createService();
  service.createDocument(createUpload());

  const { document, filePath } = service.getDocumentForDownload('uuid-1', 'user-1');

  assert.strictEqual(document.originalName, 'contrato.pdf');
  assert.strictEqual(filePath, '/fake/uuid-1');
  assert.throws(
    () => service.getDocumentForDownload('uuid-1', 'user-2'),
    DocumentNotFoundError,
  );
});

test('lança DocumentNotFoundError para id inexistente', () => {
  const service = createService();

  assert.throws(
    () => service.getDocumentForDownload('inexistente', 'user-1'),
    DocumentNotFoundError,
  );
});
