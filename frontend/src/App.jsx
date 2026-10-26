import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import { listDocuments } from './services/documentService.js';

export default function App() {
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
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>
      <label>
        Usuário{' '}
        <input value={userId} onChange={(event) => setUserId(event.target.value)} />
      </label>
      <UploadComponent userId={userId} onUploaded={loadDocuments} />
      {loadError && <p role="alert">{loadError}</p>}
      <DocumentList documents={documents} userId={userId} />
    </main>
  );
}
