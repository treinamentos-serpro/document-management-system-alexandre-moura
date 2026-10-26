const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

function createDocumentRepository({ storageDir }) {
  const documents = new Map();

  fs.mkdirSync(storageDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: storageDir,
    filename: (req, file, cb) => cb(null, crypto.randomUUID()),
  });

  return {
    storage,

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

    getFilePath(document) {
      return path.join(storageDir, document.storedName);
    },
  };
}

module.exports = { createDocumentRepository };
