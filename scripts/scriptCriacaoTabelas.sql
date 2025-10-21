-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- para crypt() e (em versões antigas) gen_random_uuid()

-- Tipos ENUM
DO $$ BEGIN
  CREATE TYPE user_role        AS ENUM ('ADMIN','MEDICO','PACIENTE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE slot_status      AS ENUM ('LIVRE','RESERVADO','CONCLUIDO','CANCELADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('AGENDADA','REALIZADA','CANCELADA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status   AS ENUM ('APROVADO','NEGADO','ESTORNADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Função de updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- Tabelas
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  cpf            TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  role           user_role NOT NULL,
  ativo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS admin_profiles (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_profiles (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  crm_crp                 TEXT NOT NULL,
  especialidade           TEXT,
  bio                     TEXT,
  valor_padrao_consulta   NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS patient_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  data_nascimento  DATE,
  telefone         TEXT,
  endereco         TEXT
);

CREATE TABLE IF NOT EXISTS schedule_slots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  inicio      TIMESTAMPTZ NOT NULL,
  fim         TIMESTAMPTZ NOT NULL,
  status      slot_status NOT NULL DEFAULT 'LIVRE',
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_slot_duration CHECK (fim > inicio)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_slots_doctor_interval
  ON schedule_slots (doctor_id, inicio, fim);

CREATE INDEX IF NOT EXISTS ix_slots_doctor_inicio
  ON schedule_slots (doctor_id, inicio);

CREATE TRIGGER trg_slots_updated_at
BEFORE UPDATE ON schedule_slots
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS appointments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id      UUID NOT NULL UNIQUE REFERENCES schedule_slots(id) ON DELETE RESTRICT,
  patient_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status       appointment_status NOT NULL DEFAULT 'AGENDADA',
  observacoes  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_appt_patient
  ON appointments (patient_id, created_at);

CREATE TRIGGER trg_appt_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE RESTRICT,
  patient_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  valor          NUMERIC(10,2) NOT NULL,
  status         payment_status NOT NULL DEFAULT 'APROVADO',
  metodo         TEXT NOT NULL DEFAULT 'CARTAO_FAKE',
  nsu_fake       TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_payments_patient_date
  ON payments (patient_id, created_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  acao        TEXT NOT NULL,
  alvo        TEXT,
  payload_json JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
