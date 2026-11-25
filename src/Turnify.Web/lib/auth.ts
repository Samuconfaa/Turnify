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

export async function register(
  firstName: string,
  lastName: string,
  businessName: string,
  email: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, businessName, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string; message?: string };
    throw new Error(err.detail ?? err.message ?? 'Errore durante la registrazione.');
  }
  const data: TokenResponse = await res.json();
  setCookie('access_token', data.accessToken, 900);
  setCookie('refresh_token', data.refreshToken, 604800);
  try {
    const payload = decodeJwt(data.accessToken);
    const role = (payload[ROLE_CLAIM] ?? payload.role ?? '') as string;
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_email', (payload.email ?? email) as string);
  } catch { /* ignore */ }
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

export async function employeeLogin(companySlug: string, username: string, password: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/auth/employee-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companySlug, username, password }),
  });
  if (!res.ok) throw new Error('Credenziali non valide.');

  const data: TokenResponse = await res.json();
  setCookie('access_token', data.accessToken, 900);
  setCookie('refresh_token', data.refreshToken, 604800);
  try {
    const payload = decodeJwt(data.accessToken);
    localStorage.setItem('user_role', (payload[ROLE_CLAIM] ?? payload.role ?? 'Employee') as string);
    localStorage.setItem('user_email', (payload.email ?? username) as string);
  } catch { /* ignore */ }
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

export function getRole(): string {
  try { return localStorage.getItem('user_role') ?? ''; } catch { return ''; }
}
