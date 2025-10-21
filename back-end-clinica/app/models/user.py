from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
from app.core.enums import UserRole

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    nome = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    cpf = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole, name="user_role", native_enum=True), nullable=False)
    ativo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    
    admin_profile = relationship("AdminProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    appointments = relationship("Appointment", foreign_keys="Appointment.patient_id", back_populates="patient")
    payments = relationship("Payment", back_populates="patient")
    audit_logs = relationship("AuditLog", back_populates="user")