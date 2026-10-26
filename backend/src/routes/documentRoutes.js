const express = require('express');
const { requireOwner } = require('../controllers/documentController');

function createDocumentRoutes({ documentController, upload }) {
  const router = express.Router();

  router.post('/upload', requireOwner, upload.single('file'), documentController.upload);
  router.get('/documents', requireOwner, documentController.list);
  router.get('/documents/:id/download', requireOwner, documentController.download);

  return router;
}

module.exports = { createDocumentRoutes };
