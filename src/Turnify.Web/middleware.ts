import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const OWNER_EMAIL = 'samuconfa08@gmail.com';
const ROLE_CLAIM  = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function decodeToken(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
}

function getClaim(token: string, key: string): string {
  const p = decodeToken(token);
  return ((p[key] ?? '') as string);
}

const ADMIN_ROLES = ['Admin', 'Owner', 'Employer'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage    = pathname === '/login' || pathname === '/login/employee';
  const isPublicPage   = pathname === '/register' || pathname === '/termini' || pathname === '/privacy' || pathname === '/cookie';
  const isEmployeePage = pathname.startsWith('/employee');
  const isDashboard    = pathname.startsWith('/dashboard');
  const accessToken    = request.cookies.get('access_token')?.value  ?? '';
  const refreshToken   = request.cookies.get('refresh_token')?.value ?? '';
  const hasSession     = !!refreshToken;

  if (pathname === '/') {
    return NextResponse.next();
  }

  if (!hasSession && !isLoginPage && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isPublicPage) {
    if (hasSession) {
      const url = request.nextUrl.clone();
      const role = getClaim(accessToken, ROLE_CLAIM) || getClaim(accessToken, 'role');
      url.pathname = role === 'Employee' ? '/employee' : '/dashboard';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (hasSession && !isLoginPage) {
    const role = getClaim(accessToken, ROLE_CLAIM) || getClaim(accessToken, 'role');

    if (isDashboard && role === 'Employee') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('bloccato', '1');
      const res = NextResponse.redirect(url);
      res.cookies.delete('access_token');
      res.cookies.delete('refresh_token');
      return res;
    }

    if (isEmployeePage && ADMIN_ROLES.includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (isEmployeePage && !role) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const res = NextResponse.redirect(url);
      res.cookies.delete('access_token');
      res.cookies.delete('refresh_token');
      return res;
    }
  }

  if (hasSession && isLoginPage) {
    const role = getClaim(accessToken, ROLE_CLAIM) || getClaim(accessToken, 'role');
    const url = request.nextUrl.clone();
    url.pathname = role === 'Employee' ? '/employee' : '/dashboard';
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/dashboard/error-logs')) {
    const email = getClaim(accessToken, 'email');
    if (email.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
