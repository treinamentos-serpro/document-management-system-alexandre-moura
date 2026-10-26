const API_BASE = '/api';

async function request(path, { userId, ...options } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'X-User-Id': userId },
  });
  if (response.ok) {
    return response;
  }
  const body = await response.json().catch(() => ({}));
  throw new Error(body.error || 'Falha na comunicação com o servidor.');
}

export async function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', { method: 'POST', userId, body: formData });
  return response.json();
}

export async function listDocuments(userId) {
  const response = await request('/documents', { userId });
  return response.json();
}

export async function downloadDocument(id, userId) {
  const response = await request(`/documents/${encodeURIComponent(id)}/download`, { userId });
  return response.blob();
}
