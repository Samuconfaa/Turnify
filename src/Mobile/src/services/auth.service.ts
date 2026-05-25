import { api, apiError } from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface EmployeeLoginRequest {
  companySlug: string;
  username: string;
  password: string;
}

export interface RegisterCompanyRequest {
  companyName: string;
  companySlug: string;
  companyEmail: string;
  adminEmail: string;
  adminPassword: string;
}

export const AuthService = {
  async loginAdmin(req: AdminLoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/login', req);
    return data;
  },

  async loginEmployee(req: EmployeeLoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/employee-login', req);
    return data;
  },

  async register(req: RegisterCompanyRequest): Promise<void> {
    await api.post('/api/auth/register', req);
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/api/auth/forgot-password', { email });
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { data } = await api.post('/api/auth/refresh', { refreshToken });
    return data;
  },

  async logout(userId: number): Promise<void> {
    await api.post('/api/auth/logout', { userId }).catch(() => {});
  },
};

export function parseJwtUser(token: string): {
  id: number;
  name: string;
  email: string | null;
  role: 'Admin' | 'Employee';
  companyId: number;
  employeeId?: number;
} | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    const role =
      decoded['role'] ??
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      'Employee';
    return {
      id: Number(decoded['sub'] ?? decoded['nameid'] ?? 0),
      name: decoded['name'] ?? decoded['unique_name'] ?? '',
      email: decoded['email'] ?? null,
      role: role === 'Admin' ? 'Admin' : 'Employee',
      companyId: Number(decoded['companyId'] ?? 0),
      employeeId: decoded['employeeId'] ? Number(decoded['employeeId']) : undefined,
    };
  } catch {
    return null;
  }
}
