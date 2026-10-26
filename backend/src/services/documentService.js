class DocumentNotFoundError extends Error {
  constructor(id) {
    super(`Documento não encontrado: ${id}`);
    this.name = 'DocumentNotFoundError';
  }
}

function createDocumentService({ documentRepository, clock = () => new Date() }) {
  return {
    createDocument({ storedName, originalName, mimeType, size, owner }) {
      const document = {
        id: storedName,
        storedName,
        originalName,
        mimeType,
        size,
        uploadedAt: clock().toISOString(),
        owner,
      };
      return documentRepository.save(document);
    },

    listDocumentsByOwner(owner) {
      return documentRepository
        .listByOwner(owner)
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    },

    getDocumentForDownload(id, owner) {
      const document = documentRepository.findById(id);
      if (!document || document.owner !== owner) {
        throw new DocumentNotFoundError(id);
      }
      return { document, filePath: documentRepository.getFilePath(document) };
    },
  };
}

module.exports = { createDocumentService, DocumentNotFoundError };
