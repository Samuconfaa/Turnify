import { api } from './api';

export interface EmployeeHoursReport {
  employeeId: number;
  employeeName: string;
  initials: string;
  totalHours: number;
  plannedHours: number;
  weeks: { label: string; hours: number }[];
}

export interface ReportTotals {
  totalHours: number;
  employeeCount: number;
  period: string;
}

export const ReportService = {
  async downloadHours(from: string, to: string): Promise<void> {
    await api.get('/api/reports/hours', { params: { from, to } });
  },

  async downloadAttendance(from: string, to: string): Promise<void> {
    await api.get('/api/reports/attendance', { params: { from, to } });
  },

  async downloadVacations(from: string, to: string): Promise<void> {
    await api.get('/api/reports/vacations', { params: { from, to } });
  },

  async getEmployeeHoursReport(from: string, to: string): Promise<EmployeeHoursReport[]> {
    const { data } = await api.get<any>('/api/reports/employee-hours', { params: { from, to } });
    return Array.isArray(data) ? data : (data.items ?? data.data ?? []);
  },

  async getReportTotals(from: string, to: string): Promise<ReportTotals> {
    const { data } = await api.get<ReportTotals>('/api/reports/totals', { params: { from, to } });
    return data;
  },
};
