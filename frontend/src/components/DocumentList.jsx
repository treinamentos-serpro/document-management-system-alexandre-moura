import DownloadButton from './DownloadButton.jsx';

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function DocumentList({ documents, userId }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado.</p>;
  }

  return (
    <section>
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
                <DownloadButton doc={doc} userId={userId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
