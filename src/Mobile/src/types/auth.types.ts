export type UserRole = 'Admin' | 'Employee';

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  companyName: string;
  adminName: string;
  adminEmail: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
  userId: number;
  name: string;
  email: string | null;
  username: string | null;
  companyId: number;
  employeeId?: number;
  avatar?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
