import { useState } from 'react';
import { downloadDocument } from '../services/documentService.js';

const REVOKE_DELAY_MS = 1000;

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Adia a revogação: alguns navegadores ainda não iniciaram o download neste ponto.
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

export default function DownloadButton({ doc, userId }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setIsDownloading(true);
    setError('');
    try {
      const blob = await downloadDocument(doc.id, userId);
      saveBlob(blob, doc.originalName);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} disabled={isDownloading}>
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && <span role="alert"> {error}</span>}
    </>
  );
}
