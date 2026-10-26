const API_BASE = '/api';

async function ensureOk(response) {
  if (response.ok) {
    return response;
  }
  const body = await response.json().catch(() => ({}));
  throw new Error(body.error || 'Falha na comunicação com o servidor.');
}

export async function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': userId },
    body: formData,
  });
  return (await ensureOk(response)).json();
}

export async function listDocuments(userId) {
  const response = await fetch(`${API_BASE}/documents`, {
    headers: { 'X-User-Id': userId },
  });
  return (await ensureOk(response)).json();
}

export async function downloadDocument(id, userId) {
  const response = await fetch(`${API_BASE}/documents/${id}/download`, {
    headers: { 'X-User-Id': userId },
  });
  return (await ensureOk(response)).blob();
}
