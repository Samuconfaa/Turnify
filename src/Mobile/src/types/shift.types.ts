export type ShiftStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';

export interface Shift {
  id: number;
  employeeId: number;
  employeeName: string;
  businessId: number;
  businessName: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  note?: string;
  recurringGroupId?: string;
}

export interface CreateShiftRequest {
  employeeId: number;
  businessId: number;
  startTime: string;
  endTime: string;
  note?: string;
}

export interface CreateRecurringShiftRequest extends CreateShiftRequest {
  recurrenceType: 'Daily' | 'Weekly';
  repeatUntil: string;
  daysOfWeek?: number[];
}

export interface ShiftSwapRequest {
  id: number;
  requestorShiftId: number;
  targetShiftId: number;
  requestorEmployeeName: string;
  targetEmployeeName: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'AdminApproved' | 'AdminRejected';
  createdAt: string;
}

export interface WeekCoverage {
  date: string;
  dayName: string;
  shiftsCount: number;
  employeesCount: number;
}
