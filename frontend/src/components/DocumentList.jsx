import DownloadButton from './DownloadButton.jsx';

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];

function formatSize(bytes) {
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < SIZE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return unitIndex === 0 ? `${value} B` : `${value.toFixed(1)} ${SIZE_UNITS[unitIndex]}`;
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
