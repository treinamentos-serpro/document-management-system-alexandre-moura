import { useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import { listDocuments } from './services/documentService.js';

export default function App() {
  const [userId, setUserId] = useState('usuario-1');
  const [documents, setDocuments] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    listDocuments(userId)
      .then((loaded) => {
        if (!ignore) {
          setDocuments(loaded);
          setLoadError('');
        }
      })
      .catch((error) => {
        if (!ignore) {
          setLoadError(error.message);
        }
      });
    return () => {
      ignore = true;
    };
  }, [userId, refreshKey]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>
      <label>
        Usuário{' '}
        <input value={userId} onChange={(event) => setUserId(event.target.value)} />
      </label>
      <UploadComponent userId={userId} onUploaded={() => setRefreshKey((key) => key + 1)} />
      {loadError && <p role="alert">{loadError}</p>}
      <DocumentList documents={documents} userId={userId} />
    </main>
  );
}
