const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

function createFileRepository({ storageDir }) {
  const root = path.resolve(storageDir);

  fs.mkdirSync(root, { recursive: true });

  const storage = multer.diskStorage({
    destination: root,
    filename: (req, file, cb) => cb(null, crypto.randomUUID()),
  });

  return {
    storage,

    resolvePath(storedName) {
      const filePath = path.resolve(root, storedName);
      if (!filePath.startsWith(root + path.sep)) {
        throw new Error('Caminho de arquivo fora do armazenamento.');
      }
      return filePath;
    },
  };
}

module.exports = { createFileRepository };
