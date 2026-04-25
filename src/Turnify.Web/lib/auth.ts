import { setCookie, deleteCookie } from './api';

interface TokenResponse { accessToken: string; refreshToken: string; }

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Credenziali non valide.');
  const data: TokenResponse = await res.json();
  setCookie('access_token', data.accessToken, 900);
  setCookie('refresh_token', data.refreshToken, 604800);
  try {
    const payload = JSON.parse(atob(data.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    localStorage.setItem('user_role', (payload[roleKey] ?? payload.role ?? '') as string);
    localStorage.setItem('user_email', (payload.email ?? email) as string);
  } catch { /* ignore JWT decode errors */ }
}

export function logout(): void {
  deleteCookie('access_token');
  deleteCookie('refresh_token');
  try { localStorage.clear(); } catch { /* ignore */ }
  window.location.href = '/login';
}

export function getEmail(): string {
  try { return localStorage.getItem('user_email') ?? ''; } catch { return ''; }
}
