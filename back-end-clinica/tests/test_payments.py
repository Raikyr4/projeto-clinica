
def test_payment_always_approved(client, test_patient, test_doctor, db):
    from app.models.schedule import ScheduleSlot
    from app.models.appointment import Appointment
    from app.core.enums import SlotStatus, AppointmentStatus
    from datetime import datetime, timedelta
    
    # Cria slot e consulta
    slot = ScheduleSlot(
        doctor_id=test_doctor.id,
        inicio=datetime.now() + timedelta(days=1),
        fim=datetime.now() + timedelta(days=1, hours=1),
        status=SlotStatus.RESERVADO
    )
    db.add(slot)
    db.flush()
    
    appointment = Appointment(
        slot_id=slot.id,
        patient_id=test_patient.id,
        status=AppointmentStatus.AGENDADA
    )
    db.add(appointment)
    db.commit()
    
    # Login do paciente
    login_response = client.post("/api/v1/auth/login", json={
        "email": "paciente@test.com",
        "password": "Test@123"
    })
    token = login_response.json()["access_token"]
    
    # Cria pagamento
    response = client.post(
        "/api/v1/payments",
        json={
            "appointment_id": str(appointment.id),
            "valor": 200.00,
            "metodo": "CARTAO_FAKE"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    assert response.json()["status"] == "APROVADO"
    assert "nsu_fake" in response.json()


# alembic.ini (exemplo básico)

"""
[alembic]
script_location = alembic
sqlalchemy.url = postgresql+psycopg2://postgres:senha@localhost:5432/clinica_psicologia

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
"""
