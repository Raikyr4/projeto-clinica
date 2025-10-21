from sqlalchemy import Column, DateTime, ForeignKey, Enum as SQLEnum, text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
from app.core.enums import SlotStatus

class ScheduleSlot(Base):
    __tablename__ = "schedule_slots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    inicio = Column(DateTime(timezone=True), nullable=False)
    fim = Column(DateTime(timezone=True), nullable=False)
    status = Column(SQLEnum(SlotStatus, name="slot_status", native_enum=True), nullable=False, default=SlotStatus.LIVRE)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    
    doctor = relationship("User", foreign_keys=[doctor_id])
    appointment = relationship("Appointment", back_populates="slot", uselist=False)
    
    __table_args__ = (Index('ix_slots_doctor_inicio', 'doctor_id', 'inicio'),)