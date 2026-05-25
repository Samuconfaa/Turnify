export type VacationRequestType = 'Holiday' | 'PaidLeave' | 'UnpaidLeave' | 'SickLeave';
export type VacationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface VacationRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  type: VacationRequestType;
  startDate: string;
  endDate: string;
  status: VacationStatus;
  note?: string;
  createdAt: string;
}

export interface CreateVacationRequest {
  type: VacationRequestType;
  startDate: string;
  endDate: string;
  note?: string;
}

export interface AttendanceLog {
  id: number;
  employeeId: number;
  checkIn: string;
  checkOut?: string;
  method: 'Manual' | 'QrCode' | 'Gps';
  date: string;
  hoursWorked?: number;
}
