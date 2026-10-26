const express = require('express');
const multer = require('multer');
const { createFileRepository } = require('./repositories/fileRepository');
const { createDocumentRepository } = require('./repositories/documentRepository');
const { createDocumentService } = require('./services/documentService');
const { createDocumentController } = require('./controllers/documentController');
const { createDocumentRoutes } = require('./routes/documentRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

function createApp({ storageDir, maxFileSizeBytes }) {
  const app = express();
  app.use(express.json());

  const fileRepository = createFileRepository({ storageDir });
  const documentRepository = createDocumentRepository();
  const documentService = createDocumentService({ documentRepository, fileRepository });
  const documentController = createDocumentController({ documentService });
  const upload = multer({
    storage: fileRepository.storage,
    limits: { fileSize: maxFileSizeBytes },
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  app.use(createDocumentRoutes({ documentController, upload }));
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
