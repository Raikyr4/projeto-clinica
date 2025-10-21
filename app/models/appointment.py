
from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, text, Index, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base
from app.core.enums import AppointmentStatus, PaymentStatus

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    slot_id = Column(UUID(as_uuid=True), ForeignKey("schedule_slots.id", ondelete="RESTRICT"), nullable=False, unique=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    status = Column(SQLEnum(AppointmentStatus, name="appointment_status", native_enum=True), nullable=False, default=AppointmentStatus.AGENDADA)
    observacoes = Column(String)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    
    slot = relationship("ScheduleSlot", back_populates="appointment")
    patient = relationship("User", foreign_keys=[patient_id], back_populates="appointments")
    payment = relationship("Payment", back_populates="appointment", uselist=False)
    
    __table_args__ = (Index('ix_appt_patient', 'patient_id', 'created_at'),)
