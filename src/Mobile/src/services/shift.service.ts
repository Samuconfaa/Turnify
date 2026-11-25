import { api } from './api';
import type { Shift, CreateShiftRequest, CreateRecurringShiftRequest, WeekCoverage } from '@/types/shift.types';

export const ShiftService = {
  async getShifts(params?: { startDate?: string; endDate?: string; employeeId?: number }): Promise<Shift[]> {
    const { data } = await api.get<unknown>('/api/shifts', { params });
    return Array.isArray(data) ? (data as Shift[]) : [];
  },

  async getShift(id: number): Promise<Shift> {
    const { data } = await api.get<Shift>(`/api/shifts/${id}`);
    return data;
  },

  async createShift(req: CreateShiftRequest): Promise<Shift> {
    const { data } = await api.post<Shift>('/api/shifts', req);
    return data;
  },

  async createRecurring(req: CreateRecurringShiftRequest): Promise<Shift[]> {
    const { data } = await api.post<Shift[]>('/api/shifts/recurring', req);
    return data;
  },

  async updateShift(id: number, req: Partial<CreateShiftRequest>): Promise<Shift> {
    const { data } = await api.put<Shift>(`/api/shifts/${id}`, req);
    return data;
  },

  async deleteShift(id: number): Promise<void> {
    await api.delete(`/api/shifts/${id}`);
  },

  async getWeekCoverage(startDate: string): Promise<WeekCoverage[]> {
    const { data } = await api.get<unknown>('/api/shifts/coverage', { params: { startDate } });
    return Array.isArray(data) ? (data as WeekCoverage[]) : [];
  },
};
