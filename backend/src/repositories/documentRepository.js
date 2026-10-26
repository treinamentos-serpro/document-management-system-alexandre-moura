function copyDocument(document) {
  return { ...document };
}

function createDocumentRepository() {
  const documents = new Map();

  return {
    save(document) {
      documents.set(document.id, copyDocument(document));
      return copyDocument(document);
    },

    findById(id) {
      const document = documents.get(id);
      return document ? copyDocument(document) : null;
    },

    listByOwner(owner) {
      return [...documents.values()]
        .filter((document) => document.owner === owner)
        .map(copyDocument);
    },
  };
}

module.exports = { createDocumentRepository };
