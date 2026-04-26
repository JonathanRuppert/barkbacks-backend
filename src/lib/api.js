export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export async function apiRequest(path, options = {}) {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Request failed');
  }

  return data;
}

export const apiFetch = apiRequest;
export const request = apiRequest;

export function apiGet(path, options = {}) {
  return apiRequest(path, { ...options, method: 'GET' });
}

export function formatCurrency(value = 0) {
  const amount = Number(value) > 999 ? Number(value) / 100 : Number(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(amount) ? amount : 0);
}

export async function uploadFile(path, formData) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Upload failed');
  }

  return data;
}
