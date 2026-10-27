const { DocumentNotFoundError } = require('../services/documentService');

function toPublicDocument({ id, originalName, mimeType, size, uploadedAt, owner }) {
  return { id, originalName, mimeType, size, uploadedAt, owner };
}

function createDocumentController({ documentService }) {
  return {
    upload(req, res) {
      if (!req.file) {
        return res.status(400).json({ error: 'Envie um arquivo no campo "file".' });
      }

      const document = documentService.createDocument({
        storedName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        owner: req.owner,
      });
      return res.status(201).json(toPublicDocument(document));
    },

    list(req, res) {
      const documents = documentService.listDocumentsByOwner(req.owner);
      return res.json(documents.map(toPublicDocument));
    },

    download(req, res, next) {
      let result;
      try {
        result = documentService.getDocumentForDownload(req.params.id, req.owner);
      } catch (error) {
        if (error instanceof DocumentNotFoundError) {
          return res.status(404).json({ error: 'Documento não encontrado.' });
        }
        return next(error);
      }

      const { document, filePath } = result;
      res.type(document.mimeType);
      res.set('X-Content-Type-Options', 'nosniff');
      return res.download(filePath, document.originalName, (error) => {
        if (error && !res.headersSent) {
          next(error);
        }
      });
    },
  };
}

module.exports = { createDocumentController };
