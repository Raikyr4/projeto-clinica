from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, text, Index, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
from app.core.enums import PaymentStatus

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id", ondelete="RESTRICT"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    valor = Column(Numeric(10, 2), nullable=False)
    status = Column(SQLEnum(PaymentStatus, name="payment_status", native_enum=True), nullable=False, default=PaymentStatus.APROVADO)
    metodo = Column(String, nullable=False, default="CARTAO_FAKE")
    nsu_fake = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    
    appointment = relationship("Appointment", back_populates="payment")
    patient = relationship("User", back_populates="payments")
    
    __table_args__ = (Index('ix_payments_patient_date', 'patient_id', 'created_at'),)