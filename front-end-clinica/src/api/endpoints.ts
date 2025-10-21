import apiClient from "./axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserResponse,
  DoctorResponse,
  AgendaSlot,
  Appointment,
  Payment,
  DashboardKPIs,
  MonthlyRevenue,
  PaginatedResponse,
  CreateUserRequest,
  UpdateUserRequest,
  CreateSlotRequest,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
  CreatePaymentRequest,
} from "@/types/api";

// Auth endpoints
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/api/v1/auth/login", data),
  
  register: (data: RegisterRequest) =>
    apiClient.post<UserResponse>("/api/v1/auth/register", data),
  
  refresh: (refreshToken: string) =>
    apiClient.post<LoginResponse>("/api/v1/auth/refresh", { refresh_token: refreshToken }),
  
  me: () =>
    apiClient.get<UserResponse>("/api/v1/auth/me"),
};

// Users endpoints (ADMIN only)
export const usersApi = {
  list: (skip = 0, limit = 50) =>
    apiClient.get<PaginatedResponse<UserResponse>>("/api/v1/users", { params: { skip, limit } }),
  
  get: (id: string) =>
    apiClient.get<UserResponse>(`/api/v1/users/${id}`),
  
  create: (data: CreateUserRequest) =>
    apiClient.post<UserResponse>("/api/v1/users", data),
  
  update: (id: string, data: UpdateUserRequest) =>
    apiClient.put<UserResponse>(`/api/v1/users/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/api/v1/users/${id}`),
};

// Doctors endpoints
export const doctorsApi = {
  list: () =>
    apiClient.get<DoctorResponse[]>("/api/v1/doctors"),
  
  get: (id: string) =>
    apiClient.get<DoctorResponse>(`/api/v1/doctors/${id}`),
  
  getProfile: (id: string) =>
    apiClient.get<DoctorResponse>(`/api/v1/doctors/${id}/profile`),
};

// Agenda/Slots endpoints
export const agendaApi = {
  getAgenda: (doctorId: string, start?: string, end?: string) =>
    apiClient.get<AgendaSlot[]>(`/api/v1/doctors/${doctorId}/agenda`, {
      params: { start, end },
    }),
  
  createSlot: (doctorId: string, data: CreateSlotRequest) =>
    apiClient.post<AgendaSlot>(`/api/v1/doctors/${doctorId}/agenda/slots`, data),
  
  deleteSlot: (slotId: string) =>
    apiClient.delete(`/api/v1/agenda/slots/${slotId}`),
};

// Appointments endpoints
export const appointmentsApi = {
  list: (skip = 0, limit = 50) =>
    apiClient.get<PaginatedResponse<Appointment>>("/api/v1/appointments", {
      params: { skip, limit },
    }),
  
  create: (data: CreateAppointmentRequest) =>
    apiClient.post<Appointment>("/api/v1/appointments", data),
  
  updateStatus: (id: string, data: UpdateAppointmentStatusRequest) =>
    apiClient.patch<Appointment>(`/api/v1/appointments/${id}/status`, data),
};

// Payments endpoints
export const paymentsApi = {
  list: (skip = 0, limit = 50) =>
    apiClient.get<PaginatedResponse<Payment>>("/api/v1/payments", {
      params: { skip, limit },
    }),
  
  get: (id: string) =>
    apiClient.get<Payment>(`/api/v1/payments/${id}`),
  
  create: (data: CreatePaymentRequest) =>
    apiClient.post<Payment>("/api/v1/payments", data),
};

// Dashboard/Reports endpoints
export const dashboardApi = {
  getKPIs: () =>
    apiClient.get<DashboardKPIs>("/api/v1/dashboard/kpis"),
};

export const reportsApi = {
  patientAppointments: () =>
    apiClient.get<Appointment[]>("/api/v1/reports/patient/appointments"),
  
  patientPayments: () =>
    apiClient.get<Payment[]>("/api/v1/reports/patient/payments"),
  
  doctorOccupancy: () =>
    apiClient.get<{ taxa_ocupacao: number }>("/api/v1/reports/doctor/occupancy"),
  
  adminMonthlyRevenue: (year: number) =>
    apiClient.get<MonthlyRevenue[]>("/api/v1/reports/admin/monthly-revenue", {
      params: { year },
    }),
};
