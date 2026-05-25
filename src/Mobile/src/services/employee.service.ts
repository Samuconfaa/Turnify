import { api } from './api';
import type { Employee, VacationBalance } from '@/types/employee.types';

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  phone?: string;
  role?: string;
  contractType: string;
  weeklyHours?: number;
  businessId?: number;
  password?: string;
}

export const EmployeeService = {
  async getEmployees(params?: { search?: string; businessId?: number; page?: number }): Promise<Employee[]> {
    const { data } = await api.get<any>('/api/employees', { params });
    return Array.isArray(data) ? data : (data.items ?? data.data ?? []);
  },

  async getEmployee(id: number): Promise<Employee> {
    const { data } = await api.get<Employee>(`/api/employees/${id}`);
    return data;
  },

  async createEmployee(req: CreateEmployeeRequest): Promise<Employee> {
    const { data } = await api.post<Employee>('/api/employees', req);
    return data;
  },

  async updateEmployee(id: number, req: Partial<CreateEmployeeRequest>): Promise<Employee> {
    const { data } = await api.put<Employee>(`/api/employees/${id}`, req);
    return data;
  },

  async deactivateEmployee(id: number): Promise<void> {
    await api.patch(`/api/employees/${id}/deactivate`);
  },

  async getVacationBalance(employeeId: number): Promise<VacationBalance> {
    const { data } = await api.get<VacationBalance>(`/api/vacation-balance/${employeeId}`);
    return data;
  },

  async updateVacationBalance(employeeId: number, totalDays: number): Promise<void> {
    await api.put(`/api/vacation-balance/${employeeId}`, { totalDays });
  },
};
