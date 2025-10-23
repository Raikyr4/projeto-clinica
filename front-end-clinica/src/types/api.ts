export type UserRole = "ADMIN" | "MEDICO" | "PACIENTE";

export type SlotStatus = "LIVRE" | "RESERVADO" | "CONCLUIDO" | "CANCELADO";

export type AppointmentStatus = "AGENDADA" | "REALIZADA" | "CANCELADA";

export type PaymentMethod = "CARTAO_FAKE" | "DINHEIRO" | "PIX";

export type PaymentStatus = "APROVADO" | "PENDENTE" | "RECUSADO";

export interface UserResponse {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  role: UserRole;
  telefone?: string;
  data_nascimento?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  cpf: string;
  password: string;
  telefone?: string;
  data_nascimento?: string;
}

export interface DoctorProfile {
  user_id: string;
  crm_crp?: string;
  especialidade?: string;
  valor_padrao_consulta?: number;
}

export interface DoctorResponse extends UserResponse {
  doctor_profile?: DoctorProfile;
}

export interface AgendaSlot {
  id: string;
  doctor_id: string;
  inicio: string;
  fim: string;
  status: SlotStatus;
  created_by?: string;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  slot_id: string;
  patient_id: string;
  doctor_id: string;
  status: AppointmentStatus;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  slot?: AgendaSlot;
  patient?: UserResponse;
  doctor?: UserResponse;
}

export interface Payment {
  id: string;
  appointment_id: string;
  valor: number;
  metodo: PaymentMethod;
  status: PaymentStatus;
  nsu_fake?: string;
  data_pagamento: string;
  created_at: string;
  updated_at: string;
  appointment?: Appointment;
}

export interface DashboardKPIs {
  total_consultas_mes: number;
  faturamento_mes: number;
  taxa_ocupacao: number;
  proximos_atendimentos: Appointment[];
}

export interface MonthlyRevenue {
  mes: string;  
  total_consultas: number;
  valor_total: number;  
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateUserRequest {
  nome: string;
  email: string;
  cpf?: string;
  password: string;
  role: UserRole;
  telefone?: string;
  data_nascimento?: string;
  crm_crp?: string;
  especialidade?: string;
  valor_padrao_consulta?: number;
}

export interface UpdateUserRequest {
  nome?: string;
  email?: string;
  cpf?: string;
  telefone?: string;
  data_nascimento?: string;
}

export interface CreateSlotRequest {
  inicio: string;
  fim: string;
}

export interface CreateAppointmentRequest {
  slot_id: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
}

export interface CreatePaymentRequest {
  appointment_id: string;
  valor: number;
  metodo: PaymentMethod;
}

export interface ConsultasPorPeriodoResponse {
  periodo: string;
  total: number;
  agendadas: number;
  realizadas: number;
  canceladas: number;
}

export interface PagamentosPorPeriodoResponse {
  periodo: string;
  total: number;
  valor_total: number;
}

export interface OcupacaoMedicoResponse {
  doctor_id: string;
  doctor_nome: string;
  total_slots: number;
  slots_livres: number;
  slots_reservados: number;
  slots_concluidos: number;
  taxa_ocupacao: number;
}

export interface ProximoAtendimento {
  id: string;
  data_hora: string;
  paciente?: string;
  medico?: string;
}
