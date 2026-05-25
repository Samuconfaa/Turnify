import { api } from './api';
import type { VacationRequest, CreateVacationRequest, VacationStatus } from '@/types/vacation.types';
import type { ShiftSwapRequest } from '@/types/shift.types';

export const VacationService = {
  async getVacations(params?: { status?: VacationStatus; employeeId?: number }): Promise<VacationRequest[]> {
    const { data } = await api.get<any>('/api/vacation-requests', { params });
    return Array.isArray(data) ? data : (data.items ?? data.data ?? []);
  },

  async createVacation(req: CreateVacationRequest): Promise<VacationRequest> {
    const { data } = await api.post<VacationRequest>('/api/vacation-requests', req);
    return data;
  },

  async approveVacation(id: number): Promise<void> {
    await api.patch(`/api/vacation-requests/${id}/approve`);
  },

  async rejectVacation(id: number): Promise<void> {
    await api.patch(`/api/vacation-requests/${id}/reject`);
  },

  async getSwapRequests(params?: { status?: string }): Promise<ShiftSwapRequest[]> {
    const { data } = await api.get<any>('/api/shift-swaps', { params });
    return Array.isArray(data) ? data : (data.items ?? []);
  },

  async approveSwap(id: number): Promise<void> {
    await api.patch(`/api/shift-swaps/${id}/approve`);
  },

  async rejectSwap(id: number): Promise<void> {
    await api.patch(`/api/shift-swaps/${id}/reject`);
  },
};
