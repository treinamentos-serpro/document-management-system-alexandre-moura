const express = require('express');
const multer = require('multer');
const { createDocumentRepository } = require('./repositories/documentRepository');
const { createDocumentService } = require('./services/documentService');
const { createDocumentController } = require('./controllers/documentController');
const { createDocumentRoutes } = require('./routes/documentRoutes');

function handleMulterError(error, res) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Arquivo acima do tamanho máximo permitido.' });
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Campo de arquivo inesperado. Use "file".' });
  }
  return res.status(400).json({ error: error.message });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }
  if (error instanceof multer.MulterError) {
    return handleMulterError(error, res);
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Corpo JSON inválido.' });
  }
  console.error(error);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

function createApp({ storageDir, maxFileSizeBytes }) {
  const app = express();
  app.use(express.json());

  const documentRepository = createDocumentRepository({ storageDir });
  const documentService = createDocumentService({ documentRepository });
  const documentController = createDocumentController({ documentService });
  const upload = multer({
    storage: documentRepository.storage,
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
