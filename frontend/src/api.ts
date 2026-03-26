import { auth } from './firebase';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TIMEOUT_MS = 30_000;

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      signal: controller.signal,
      body: isForm
        ? (body as FormData)
        : body !== undefined
        ? JSON.stringify(body)
        : undefined,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      const e = new Error('Request timed out. Please try again.') as Error & { status: number };
      e.status = 408;
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const e = new Error(err.detail || 'API error') as Error & { status: number };
    e.status = res.status;
    throw e;
  }

  return res.status === 204 ? null : res.json();
}
