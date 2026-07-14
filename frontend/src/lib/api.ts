'use client';

import { useAuth } from './auth-store';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function tryRefresh(): Promise<string | null> {
  const { refreshToken, setSession, clear } = useAuth.getState();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error('refresh failed');
    const data = await res.json();
    setSession(data);
    return data.accessToken as string;
  } catch {
    clear();
    return null;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit & { raw?: boolean } = {},
): Promise<T> {
  const call = async (token: string | null) =>
    fetch(`${API_URL}/api${path}`, {
      ...options,
      headers: {
        ...(options.body && !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });

  let res = await call(useAuth.getState().accessToken);
  if (res.status === 401) {
    const token = await tryRefresh();
    if (token) res = await call(token);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Erro ${res.status}`);
  }
  if (options.raw) return res as unknown as T;
  return res.json() as Promise<T>;
}

export async function downloadReport(format: 'csv' | 'excel' | 'pdf') {
  const res = await api<Response>(`/reports/${format}`, { raw: true });
  const blob = await res.blob();
  const ext = format === 'excel' ? 'xlsx' : format;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `afiliados.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
