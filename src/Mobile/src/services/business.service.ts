import { api } from './api';
import type { Business, OpeningHours } from '@/types/employee.types';

export interface CreateBusinessRequest {
  name: string;
  businessType?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export const BusinessService = {
  async getBusinesses(): Promise<Business[]> {
    const { data } = await api.get<any>('/api/businesses');
    return Array.isArray(data) ? data : (data.items ?? []);
  },

  async getBusiness(id: number): Promise<Business> {
    const { data } = await api.get<Business>(`/api/businesses/${id}`);
    return data;
  },

  async createBusiness(req: CreateBusinessRequest): Promise<Business> {
    const { data } = await api.post<Business>('/api/businesses', req);
    return data;
  },

  async updateBusiness(id: number, req: Partial<CreateBusinessRequest>): Promise<Business> {
    const { data } = await api.put<Business>(`/api/businesses/${id}`, req);
    return data;
  },

  async getOpeningHours(businessId: number): Promise<OpeningHours[]> {
    const { data } = await api.get<OpeningHours[]>(`/api/businesses/${businessId}/hours`);
    return Array.isArray(data) ? data : [];
  },

  async saveOpeningHours(businessId: number, hours: OpeningHours[]): Promise<void> {
    await api.put(`/api/businesses/${businessId}/hours`, hours);
  },
};
