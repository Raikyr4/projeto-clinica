import enum

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MEDICO = "MEDICO"
    PACIENTE = "PACIENTE"

class SlotStatus(str, enum.Enum):
    LIVRE = "LIVRE"
    RESERVADO = "RESERVADO"
    CONCLUIDO = "CONCLUIDO"
    CANCELADO = "CANCELADO"

class AppointmentStatus(str, enum.Enum):
    AGENDADA = "AGENDADA"
    REALIZADA = "REALIZADA"
    CANCELADA = "CANCELADA"

class PaymentStatus(str, enum.Enum):
    APROVADO = "APROVADO"
    NEGADO = "NEGADO"
    ESTORNADO = "ESTORNADO"
