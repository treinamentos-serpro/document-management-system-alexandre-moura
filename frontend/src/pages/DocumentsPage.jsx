import { useCallback, useEffect, useState } from 'react';
import UploadForm from '../components/UploadForm.jsx';
import DocumentList from '../components/DocumentList.jsx';
import { listDocuments } from '../services/documentService.js';

export default function DocumentsPage() {
  const [userId, setUserId] = useState('usuario-1');
  const [documents, setDocuments] = useState([]);
  const [loadError, setLoadError] = useState('');

  const loadDocuments = useCallback(async () => {
    try {
      setDocuments(await listDocuments(userId));
      setLoadError('');
    } catch (error) {
      setLoadError(error.message);
    }
  }, [userId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <>
      <label>
        Usuário{' '}
        <input value={userId} onChange={(event) => setUserId(event.target.value)} />
      </label>
      <UploadForm userId={userId} onUploaded={loadDocuments} />
      {loadError && <p role="alert">{loadError}</p>}
      <DocumentList documents={documents} userId={userId} />
    </>
  );
}
