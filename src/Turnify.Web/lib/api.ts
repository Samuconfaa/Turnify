const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const entry = document.cookie.split(';').find(c => c.trim().startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.trim().slice(name.length + 1)) : null;
}

export function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; path=/; SameSite=Lax`;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getCookie('access_token');

  const makeReq = (t: string | null) =>
    fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...(options.headers as Record<string, string> | undefined),
      },
    });

  let res = await makeReq(token);

  if (res.status === 401) {
    const refreshToken = getCookie('refresh_token');
    if (refreshToken) {
      const refreshRes = await fetch(`${BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setCookie('access_token', data.accessToken, 900);
        setCookie('refresh_token', data.refreshToken, 604800);
        res = await makeReq(data.accessToken);
      }
    }
    if (res.status === 401) {
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      window.location.href = '/login';
      throw new Error('Sessione scaduta');
    }
  }

  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string; message?: string }).detail ?? (err as { message?: string }).message ?? `Errore ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                 => request<T>(path),
  post:   <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST',   body: body !== undefined ? JSON.stringify(body) : undefined }),
  put:    <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT',    body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T = void>(path: string)          => request<T>(path, { method: 'DELETE' }),
};
