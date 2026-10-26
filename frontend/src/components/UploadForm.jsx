import { useState } from 'react';
import { uploadDocument } from '../services/documentService.js';

export default function UploadForm({ userId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setFeedback({ type: 'error', message: 'Selecione um arquivo para enviar.' });
      return;
    }

    setIsSending(true);
    try {
      await uploadDocument(file, userId);
      setFeedback({ type: 'success', message: 'Documento enviado com sucesso.' });
      setFile(null);
      event.target.reset();
      onUploaded();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        onChange={(event) => setFile(event.target.files[0] ?? null)}
        disabled={isSending}
      />
      <button type="submit" disabled={isSending}>
        {isSending ? 'Enviando...' : 'Enviar'}
      </button>
      {feedback.message && <p role="status" data-type={feedback.type}>{feedback.message}</p>}
    </form>
  );
}
