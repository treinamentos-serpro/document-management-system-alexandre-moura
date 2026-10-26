const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { once } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../src/createApp');

const MAX_FILE_SIZE_BYTES = 1024;
let server;
let baseUrl;
let storageDir;

before(async () => {
  storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-api-'));
  server = createApp({ storageDir, maxFileSizeBytes: MAX_FILE_SIZE_BYTES }).listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  fs.rmSync(storageDir, { recursive: true, force: true });
});

function buildFileForm(content, { field = 'file', name = 'contrato.pdf', type = 'application/pdf' } = {}) {
  const form = new FormData();
  form.append(field, new Blob([content], { type }), name);
  return form;
}

function upload(userId, form) {
  const headers = userId ? { 'X-User-Id': userId } : {};
  return fetch(`${baseUrl}/upload`, { method: 'POST', headers, body: form });
}

function listDocuments(userId) {
  return fetch(`${baseUrl}/documents`, { headers: { 'X-User-Id': userId } });
}

function download(userId, id) {
  return fetch(`${baseUrl}/documents/${id}/download`, { headers: { 'X-User-Id': userId } });
}

test('GET /health responde ok', async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(await response.json(), { status: 'ok' });
});

test('POST /upload salva o arquivo e retorna metadados sem storedName', async () => {
  const response = await upload('user-upload', buildFileForm('conteudo do contrato'));
  const body = await response.json();

  assert.strictEqual(response.status, 201);
  assert.strictEqual(body.originalName, 'contrato.pdf');
  assert.strictEqual(body.mimeType, 'application/pdf');
  assert.strictEqual(body.size, 'conteudo do contrato'.length);
  assert.strictEqual(body.owner, 'user-upload');
  assert.ok(body.uploadedAt);
  assert.strictEqual(body.storedName, undefined);
  assert.ok(fs.existsSync(path.join(storageDir, body.id)));
});

test('POST /upload rejeita requisição sem X-User-Id sem gravar arquivo', async () => {
  const filesBefore = fs.readdirSync(storageDir).length;

  const response = await upload(null, buildFileForm('sem dono'));

  assert.strictEqual(response.status, 401);
  assert.strictEqual(fs.readdirSync(storageDir).length, filesBefore);
});

test('POST /upload rejeita envio sem arquivo', async () => {
  const response = await upload('user-upload', new FormData());

  assert.strictEqual(response.status, 400);
  assert.ok((await response.json()).error);
});

test('POST /upload rejeita campo de arquivo inesperado', async () => {
  const response = await upload('user-upload', buildFileForm('x', { field: 'outro' }));

  assert.strictEqual(response.status, 400);
});

test('POST /upload rejeita arquivo acima do limite com 413', async () => {
  const response = await upload('user-upload', buildFileForm('x'.repeat(MAX_FILE_SIZE_BYTES + 1)));

  assert.strictEqual(response.status, 413);
});

test('GET /documents lista somente os documentos do usuário', async () => {
  await upload('user-list', buildFileForm('primeiro', { name: 'a.txt', type: 'text/plain' }));
  await upload('user-other', buildFileForm('segundo', { name: 'b.txt', type: 'text/plain' }));

  const response = await listDocuments('user-list');
  const documents = await response.json();

  assert.strictEqual(response.status, 200);
  assert.ok(documents.length >= 1);
  assert.ok(documents.every((document) => document.owner === 'user-list'));
});

test('GET /documents rejeita requisição sem X-User-Id', async () => {
  const response = await fetch(`${baseUrl}/documents`);

  assert.strictEqual(response.status, 401);
});

test('GET /documents/:id/download devolve o conteúdo com tipo e nome originais', async () => {
  const uploaded = await (await upload('user-download', buildFileForm('conteudo baixado'))).json();

  const response = await download('user-download', uploaded.id);

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.headers.get('content-type'), 'application/pdf');
  assert.ok(response.headers.get('content-disposition').includes('contrato.pdf'));
  assert.strictEqual(await response.text(), 'conteudo baixado');
});

test('GET /documents/:id/download retorna 404 para outro usuário', async () => {
  const uploaded = await (await upload('user-owner', buildFileForm('privado'))).json();

  const response = await download('user-intruder', uploaded.id);

  assert.strictEqual(response.status, 404);
});

test('GET /documents/:id/download retorna 404 para id inexistente', async () => {
  const response = await download('user-download', 'inexistente');

  assert.strictEqual(response.status, 404);
});
