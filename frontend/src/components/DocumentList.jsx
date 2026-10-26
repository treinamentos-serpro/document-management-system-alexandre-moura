import { useState } from 'react';
import { downloadDocument } from '../services/documentService.js';

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DocumentList({ documents, userId }) {
  const [downloadError, setDownloadError] = useState('');

  async function handleDownload(doc) {
    try {
      const blob = await downloadDocument(doc.id, userId);
      saveBlob(blob, doc.originalName);
      setDownloadError('');
    } catch (error) {
      setDownloadError(error.message);
    }
  }

  if (documents.length === 0) {
    return <p>Nenhum documento enviado.</p>;
  }

  return (
    <section>
      {downloadError && <p role="alert">{downloadError}</p>}
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Tamanho</th>
            <th>Enviado em</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.originalName}</td>
              <td>{doc.mimeType}</td>
              <td>{formatSize(doc.size)}</td>
              <td>{new Date(doc.uploadedAt).toLocaleString('pt-BR')}</td>
              <td>
                <button type="button" onClick={() => handleDownload(doc)}>
                  Baixar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
