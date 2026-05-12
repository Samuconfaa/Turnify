import { setCookie, deleteCookie } from './api';

interface TokenResponse { accessToken: string; refreshToken: string; }

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function decodeJwt(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Credenziali non valide.');

  const data: TokenResponse = await res.json();
  const payload = decodeJwt(data.accessToken);
  const role = (payload[ROLE_CLAIM] ?? payload.role ?? '') as string;

  if (role === 'Employee') {
    throw new Error('employee');
  }

  setCookie('access_token', data.accessToken, 900);
  setCookie('refresh_token', data.refreshToken, 604800);
  try {
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_email', (payload.email ?? email) as string);
  } catch { /* ignore */ }
}

export function logout(): void {
  deleteCookie('access_token');
  deleteCookie('refresh_token');
  try { localStorage.clear(); } catch { /* ignore */ }
  window.location.href = '/admin/login';
}

export function getEmail(): string {
  try { return localStorage.getItem('user_email') ?? ''; } catch { return ''; }
}

export function getRole(): string {
  try { return localStorage.getItem('user_role') ?? ''; } catch { return ''; }
}
