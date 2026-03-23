import { auth } from './firebase';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiCall(
  method: string,
  path: string,
  body?: unknown,
  isForm?: boolean,
) {
  const token = await auth.currentUser?.getIdToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isForm
      ? (body as FormData)
      : body !== undefined
      ? JSON.stringify(body)
      : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const e = new Error(err.detail || 'API error') as Error & { status: number };
    e.status = res.status;
    throw e;
  }

  return res.status === 204 ? null : res.json();
}
