export type ContractType = 'FullTime' | 'PartTime' | 'Freelance' | 'Internship';

export interface Employee {
  id: number;
  userId: number;
  name: string;
  email: string | null;
  username: string | null;
  phone?: string;
  contractType: ContractType;
  businessId?: number;
  businessName?: string;
  isActive: boolean;
  avatar?: string;
  availableDays?: number[];
}

export interface Business {
  id: number;
  name: string;
  description?: string;
  businessType?: string;
  address?: string;
  phone?: string;
  companyId: number;
  isActive?: boolean;
  openingHours?: OpeningHours[];
}

export interface OpeningHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface VacationBalance {
  employeeId: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}
