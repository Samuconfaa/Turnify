import { api } from './api';
import type { AttendanceLog } from '@/types/vacation.types';

export interface AttendanceSummary {
  weekHours: number;
  weekTarget: number;
  monthHours: number;
  monthTarget: number;
  monthDaysWorked: number;
  monthTotalMinutes: number;
}

export const AttendanceService = {
  async checkIn(): Promise<AttendanceLog> {
    const { data } = await api.post<AttendanceLog>('/api/attendance/check-in');
    return data;
  },

  async checkOut(): Promise<AttendanceLog> {
    const { data } = await api.post<AttendanceLog>('/api/attendance/check-out');
    return data;
  },

  async getTodayAttendance(employeeId: number): Promise<AttendanceLog | null> {
    const { data } = await api.get<AttendanceLog>(`/api/attendance/today/${employeeId}`);
    return data;
  },

  async getHistory(employeeId: number, params?: { month?: number; year?: number; page?: number }): Promise<AttendanceLog[]> {
    const { data } = await api.get<any>(`/api/attendance/${employeeId}`, { params });
    return Array.isArray(data) ? data : (data.items ?? data.data ?? []);
  },

  async getSummary(employeeId: number): Promise<AttendanceSummary> {
    const { data } = await api.get<AttendanceSummary>(`/api/attendance/${employeeId}/summary`);
    return data;
  },
};
