# Clínica de Psicologia — API (FastAPI + PostgreSQL)

Documentação oficial da API para gestão de uma **clínica de psicologia**.  
Inclui autenticação JWT, RBAC (Admin/Médico/Paciente), CRUD completo, agendas, consultas, **pagamento simulado**, relatórios e endpoints para dashboards.

> **Sem Docker**. Banco **PostgreSQL local** (psycopg2). ORM **SQLAlchemy 2.x (declarative)** com migrações **Alembic**.

---

## Sumário

- [Visão geral](#visão-geral)
- [Arquitetura & Stack](#arquitetura--stack)
- [Regras de Acesso (RBAC)](#regras-de-acesso-rbac)
- [Instalação & Execução](#instalação--execução)
- [Configuração (.env)](#configuração-env)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Modelo de Dados (Entidades)](#modelo-de-dados-entidades)
- [Scripts SQL (Criação e Seeds)](#scripts-sql-criação-e-seeds)
- [Convenções da API](#convenções-da-api)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Users & Perfis](#users--perfis)
  - [Agenda (Slots)](#agenda-slots)
  - [Consultas (Appointments)](#consultas-appointments)
  - [Pagamentos (Simulado)](#pagamentos-simulado)
  - [Relatórios](#relatórios)
  - [Dashboard](#dashboard)
- [Erros & Códigos](#erros--códigos)
- [Testes](#testes)
- [Boas Práticas & Segurança](#boas-práticas--segurança)
- [Roadmap](#roadmap)
- [Licença](#licença)

---

## Visão geral

A API permite:

- **Usuários**: Admin, Médico, Paciente.
- **Cadastro**:
  - **Paciente** pode **se auto-cadastrar** (público).
  - **Médico** **só** é criado por **Admin**.
- **Agenda**: médicos gerenciam seus **slots** (horários).
- **Consultas**: pacientes reservam **slots livres**; fluxo atômico sem overbooking.
- **Pagamentos**: **simulados** (sempre aprovados), registro financeiro básico.
- **Relatórios**: por paciente, médico e admin.
- **Dashboards**: KPIs mensais, faturamento diário, ocupação por médico.

---

## Arquitetura & Stack

- **Linguagem**: Python 3.11+
- **Framework Web**: FastAPI
- **ORM**: SQLAlchemy 2.x (declarative, `native_enum=True`)
- **Migrações**: Alembic
- **Banco**: PostgreSQL local (driver `psycopg2`)
- **Auth**: JWT (access + refresh), senhas com `bcrypt`
- **Config**: `python-dotenv`
- **Docs**: OpenAPI/Swagger em `/docs` e `/redoc`

---

## Regras de Acesso (RBAC)

| Ação                                              | ADMIN | MÉDICO                   | PACIENTE                      |
|---------------------------------------------------|:-----:|:-------------------------:|:-----------------------------:|
| Auto-cadastro                                     |   ❌  |            ❌             | **✅** (cria User+PatientProfile) |
| Criar médico                                      | **✅** |            ❌             | ❌ |
| CRUD usuários (geral)                             | **✅** |            ❌             | ❌ (apenas seu perfil) |
| Gerenciar própria agenda                          | **✅** | **✅ (somente a sua)**     | ❌ |
| Reservar consulta                                 |   ❌  |            ❌             | **✅ (para si)** |
| Mudar status da própria consulta                  | **✅** | **✅ (suas consultas)**     | ✅ (cancelar conforme regra) |
| Relatórios globais                                | **✅** |            ❌             | ❌ |
| Relatórios do próprio escopo                      |   —   | **✅**                     | **✅** |

---

## Instalação & Execução

1) **Criar o banco**:
```sql
CREATE DATABASE clinica_psicologia;
```

2) **Clonar o projeto** e instalar dependências:
```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows  (no Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt
```

3) **Configurar `.env`** (ver seção abaixo).

4) **Criar estrutura do banco** (opção A = Alembic / opção B = SQL direto):
- **A) Alembic**  
  - Configure `alembic.ini` com sua `sqlalchemy.url`  
  - Gere/rode migração inicial:
    ```bash
    alembic revision --autogenerate -m "init"
    alembic upgrade head
    ```
- **B) SQL direto**  
  - Execute o DDL em [Scripts SQL](#scripts-sql-criação-e-seeds) com `psql`:
    ```bash
    psql -U postgres -d clinica_psicologia -f db/schema.sql
    psql -U postgres -d clinica_psicologia -f db/seeds.sql
    ```

5) **Rodar a API**:
```bash
uvicorn app.main:app --reload
```
Acesse: `http://localhost:8000/docs`

---

## Configuração (.env)

```ini
DATABASE_URL=postgresql+psycopg2://postgres:SENHA@localhost:5432/clinica_psicologia
SECRET_KEY=troque_esta_chave
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_MINUTES=43200  # 30 dias, se desejar
```

---

## Estrutura de Pastas

```
app/
  api/              # routers: auth, users, profiles, doctors, slots, appointments, payments, reports, dash
  core/             # settings, db, security, jwt, deps (RBAC)
  models/           # SQLAlchemy (User, DoctorProfile, PatientProfile, ScheduleSlot, Appointment, Payment, AuditLog)
  schemas/          # Pydantic v2 (request/response)
  repositories/     # consultas ao banco por entidade
  services/         # regras de negócio (reserva atômica, relatórios, etc.)
  utils/
  main.py
alembic/
db/
  schema.sql        # DDL (criação)
  seeds.sql         # DML (população)
tests/
.env.example
requirements.txt
README.md
```

---

## Modelo de Dados (Entidades)

**User**
- `id: UUID (PK)`  
- `nome: text`  
- `email: text (único)`  
- `cpf: text (único)`  
- `password_hash: text`  
- `role: ENUM('ADMIN','MEDICO','PACIENTE')`  
- `ativo: bool`  
- `created_at, updated_at: timestamptz`

**DoctorProfile** (1–1 com `users` onde `role='MEDICO'`)
- `id: UUID (PK)`  
- `user_id: UUID (UK, FK users.id)`  
- `crm_crp: text`  
- `especialidade: text`  
- `bio: text`  
- `valor_padrao_consulta: numeric(10,2)`

**PatientProfile** (1–1 com `users` onde `role='PACIENTE'`)
- `id: UUID (PK)`  
- `user_id: UUID (UK, FK users.id)`  
- `data_nascimento: date`  
- `telefone: text`  
- `endereco: text`

**ScheduleSlot** (agenda do médico)
- `id: UUID (PK)`  
- `doctor_id: UUID (FK users.id)`  
- `inicio, fim: timestamptz`  
- `status: ENUM('LIVRE','RESERVADO','CONCLUIDO','CANCELADO')`  
- `created_by, updated_by: UUID (FK users.id)`  
- `created_at, updated_at: timestamptz`  
- **Índices**: `(doctor_id, inicio)`; (doctor_id, inicio, fim) único

**Appointment** (consulta)
- `id: UUID (PK)`  
- `slot_id: UUID (FK schedule_slots.id, UNIQUE)`  
- `patient_id: UUID (FK users.id)`  
- `status: ENUM('AGENDADA','REALIZADA','CANCELADA')`  
- `observacoes: text`  
- `created_at, updated_at: timestamptz`

**Payment** (simulado)
- `id: UUID (PK)`  
- `appointment_id: UUID (FK appointments.id)`  
- `patient_id: UUID (FK users.id)`  
- `valor: numeric(10,2)`  
- `status: ENUM('APROVADO','NEGADO','ESTORNADO')` (default: APROVADO)  
- `metodo: text` (default: `CARTAO_FAKE`)  
- `nsu_fake: text`  
- `created_at: timestamptz`

**AuditLog**
- `id: UUID (PK)`  
- `user_id: UUID (FK users.id)`  
- `acao: text`  
- `alvo: text`  
- `payload_json: jsonb`  
- `created_at: timestamptz`

---

## Scripts SQL (Criação e Seeds)

### `db/schema.sql` (DDL)
> Inclui enums, tabelas, índices e triggers de `updated_at`.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN','MEDICO','PACIENTE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE slot_status AS ENUM ('LIVRE','RESERVADO','CONCLUIDO','CANCELADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('AGENDADA','REALIZADA','CANCELADA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('APROVADO','NEGADO','ESTORNADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

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
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
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
CREATE TRIGGER trg_slots_updated_at BEFORE UPDATE ON schedule_slots
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
CREATE INDEX IF NOT EXISTS ix_appt_patient ON appointments (patient_id, created_at);
CREATE TRIGGER trg_appt_updated_at BEFORE UPDATE ON appointments
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
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  acao         TEXT NOT NULL,
  alvo         TEXT,
  payload_json JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `db/seeds.sql` (DML)

```sql
INSERT INTO users (id, nome, email, cpf, password_hash, role)
VALUES
  ('11111111-1111-1111-1111-111111111111','Admin Master','admin@clinica.local','00000000000',crypt('Admin@123', gen_salt('bf')),'ADMIN'),
  ('22222222-2222-2222-2222-222222222222','Dra. Ana Silva','ana.silva@clinica.local','11111111111',crypt('Medico@123', gen_salt('bf')),'MEDICO'),
  ('33333333-3333-3333-3333-333333333333','Dr. Bruno Souza','bruno.souza@clinica.local','22222222222',crypt('Medico@123', gen_salt('bf')),'MEDICO'),
  ('44444444-4444-4444-4444-444444444444','Carla Paciente','carla@exemplo.com','33333333333',crypt('Paciente@123', gen_salt('bf')),'PACIENTE'),
  ('55555555-5555-5555-5555-555555555555','Diego Paciente','diego@exemplo.com','44444444444',crypt('Paciente@123', gen_salt('bf')),'PACIENTE'),
  ('66666666-6666-6666-6666-666666666666','Eva Paciente','eva@exemplo.com','55555555555',crypt('Paciente@123', gen_salt('bf')),'PACIENTE');

INSERT INTO admin_profiles (id, user_id) VALUES
  ('aaaaaaa1-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111');

INSERT INTO doctor_profiles (id, user_id, crm_crp, especialidade, bio, valor_padrao_consulta) VALUES
  ('bbbbbbb1-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','CRP 12/3456','TCC','Atendimento adulto',250.00),
  ('bbbbbbb2-0000-0000-0000-000000000002','33333333-3333-3333-3333-333333333333','CRP 34/7890','Psicanálise','Adolescentes',220.00);

INSERT INTO patient_profiles (id, user_id, data_nascimento, telefone, endereco) VALUES
  ('ccccccc1-0000-0000-0000-000000000001','44444444-4444-4444-4444-444444444444','1992-05-10','(62)90000-0001','Rua A, 123'),
  ('ccccccc2-0000-0000-0000-000000000002','55555555-5555-5555-5555-555555555555','1988-09-20','(62)90000-0002','Rua B, 456'),
  ('ccccccc3-0000-0000-0000-000000000003','66666666-6666-6666-6666-666666666666','1996-02-14','(62)90000-0003','Rua C, 789');

WITH base AS (SELECT date_trunc('day', now()) + interval '1 day' AS d)
INSERT INTO schedule_slots (id, doctor_id, inicio, fim, status, created_by) VALUES
  ('77777777-7777-7777-7777-777777777701','22222222-2222-2222-2222-222222222222',(SELECT d + time '09:00' FROM base),(SELECT d + time '10:00' FROM base),'LIVRE','11111111-1111-1111-1111-111111111111'),
  ('77777777-7777-7777-7777-777777777702','22222222-2222-2222-2222-222222222222',(SELECT d + time '10:00' FROM base),(SELECT d + time '11:00' FROM base),'LIVRE','11111111-1111-1111-1111-111111111111'),
  ('77777777-7777-7777-7777-777777777703','33333333-3333-3333-3333-333333333333',(SELECT d + time '14:00' FROM base),(SELECT d + time '15:00' FROM base),'LIVRE','11111111-1111-1111-1111-111111111111');

UPDATE schedule_slots SET status='RESERVADO'
 WHERE id='77777777-7777-7777-7777-777777777701';

INSERT INTO appointments (id, slot_id, patient_id, status, observacoes) VALUES
  ('88888888-8888-8888-8888-888888888881','77777777-7777-7777-7777-777777777701','44444444-4444-4444-4444-444444444444','AGENDADA','Primeira sessão');

INSERT INTO payments (id, appointment_id, patient_id, valor, status, metodo, nsu_fake, created_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','88888888-8888-8888-8888-888888888881','44444444-4444-4444-444444444444',250.00,'APROVADO','CARTAO_FAKE',concat('NSU-', floor(random()*1000000)::text), now());

INSERT INTO audit_logs (id, user_id, acao, alvo, payload_json) VALUES
  ('adadadad-adad-adad-adad-adadadadad01','11111111-1111-1111-1111-111111111111','SEED','INIT','{"message":"Banco inicializado"}');
```

---

## Convenções da API

- **Autenticação**: Bearer Token (JWT) em `Authorization: Bearer <token>`.
- **Datas**: ISO 8601 com timezone (timestamptz).
- **Paginação**: `?page=1&size=20&sort=campo,asc|desc`
- **Filtros de período**: `?start=YYYY-MM-DD` & `?end=YYYY-MM-DD` ou ISO completo.
- **Erros**: JSON `{ "detail": "...", "code": "..." }`.

---

## Endpoints

### Auth

#### `POST /auth/register`
- **Público**: cria **PACIENTE** (auto-cadastro).  
- **Com token ADMIN**: pode criar qualquer **role** (inclusive `MEDICO`) + perfil correspondente.

**Request (auto-cadastro paciente)**
```json
{
  "nome": "João Paciente",
  "email": "joao@exemplo.com",
  "cpf": "12345678901",
  "password": "Senha@123",
  "role": "PACIENTE",
  "profile": {
    "data_nascimento": "1990-01-01",
    "telefone": "(62)9....",
    "endereco": "Rua X"
  }
}
```

**Response 201**
```json
{
  "id": "UUID",
  "nome": "João Paciente",
  "email": "joao@exemplo.com",
  "role": "PACIENTE"
}
```

#### `POST /auth/login`
**Request**
```json
{ "email": "admin@clinica.local", "password": "Admin@123" }
```
**Response 200**
```json
{
  "access_token": "JWT",
  "refresh_token": "JWT",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### `POST /auth/refresh` → retorna novo `access_token`.

#### `GET /auth/me` → dados do usuário autenticado.

---

### Users & Perfis

#### `GET /users` (ADMIN)  
Filtros: `role`, `ativo`, paginação.

#### `POST /users` (ADMIN)  
Cria **ADMIN/MÉDICO/PACIENTE**. Ao criar **MÉDICO**, enviar também `DoctorProfile`.

#### `GET /users/{id}` (ADMIN)  
`PUT /users/{id}`, `DELETE /users/{id}` (ADMIN)

#### `PATCH /users/{id}/password`  
- Próprio usuário (com confirmação da senha atual) **ou** Admin.

#### Perfis do próprio usuário
- `GET/PUT /profiles/patient/me` (PACIENTE)
- `GET/PUT /profiles/doctor/me` (MÉDICO)

#### Listagem pública de médicos
- `GET /doctors?especialidade=TCC&nome=Ana`

---

### Agenda (Slots)

#### `GET /doctors/{doctor_id}/agenda?start&end`
Lista slots no intervalo.

#### `POST /doctors/{doctor_id}/agenda/slots` (ADMIN ou **o próprio MÉDICO**)
Criação em lote opcional.
```json
{
  "slots": [
    { "inicio": "2025-10-22T09:00:00-03:00", "fim": "2025-10-22T10:00:00-03:00" },
    { "inicio": "2025-10-22T10:00:00-03:00", "fim": "2025-10-22T11:00:00-03:00" }
  ]
}
```

#### `PUT /agenda/slots/{slot_id}`  
Atualiza horário/status (MÉDICO dono ou ADMIN).

#### `DELETE /agenda/slots/{slot_id}`  
Somente se `status = LIVRE`.

---

### Consultas (Appointments)

#### **Reserva atômica** — `POST /appointments` (PACIENTE)
**Request**
```json
{ "slot_id": "UUID", "observacoes": "Preferência atendimento online" }
```
**Regras**:
- Transação: `SELECT ... FOR UPDATE` no slot → checa `LIVRE` → marca `RESERVADO` → cria `Appointment`.
- Retorna 409 se o slot já estiver indisponível.

**Response 201**
```json
{
  "id": "UUID",
  "slot_id": "UUID",
  "patient_id": "UUID",
  "status": "AGENDADA"
}
```

#### `GET /appointments`
- **Paciente**: só as suas
- **Médico**: só das suas agendas
- **Admin**: todas  
Filtros: `status`, `doctor_id`, `patient_id`, `start`, `end`.

#### `PATCH /appointments/{id}/status`
- **Médico**: `REALIZADA` ou `CANCELADA` (se sua).  
- **Paciente**: pode **cancelar** (política de prazo configurável).

---

### Pagamentos (Simulado)

#### `POST /payments` (PACIENTE)
**Request**
```json
{
  "appointment_id": "UUID",
  "card_number": "4111111111111111",
  "holder_name": "João Paciente",
  "cpf": "12345678901",
  "amount": 250.00
}
```
**Comportamento**: **sempre aprova** e registra:
```json
{
  "id": "UUID",
  "status": "APROVADO",
  "nsu_fake": "NSU-123456",
  "valor": 250.00,
  "created_at": "2025-10-20T21:00:00Z"
}
```

#### `GET /payments`
- **Paciente**: seus pagamentos
- **Admin**: todos (filtros por período/status)

---

### Relatórios

#### Paciente
- `GET /reports/patient/{patient_id}/appointments?start&end&status`
- `GET /reports/patient/{patient_id}/payments?start&end`

#### Médico
- `GET /reports/doctor/{doctor_id}/attendance?start&end`  
  → { agendadas, realizadas, canceladas, taxa_comparecimento }
- `GET /reports/doctor/{doctor_id}/workload?start&end`  
  → ocupação por dia/semana, horas atendidas

#### Admin
- `GET /reports/admin/revenue?month=YYYY-MM`  
  → soma de `payments.status=APROVADO`
- `GET /reports/admin/appointments-by-doctor?start&end`  
  → quantidade por médico
- `GET /reports/admin/top-patients?start&end&limit=10`  
  → maiores valores pagos

---

### Dashboard

- `GET /dash/kpis?month=YYYY-MM`  
  → `{ totalConsultas, realizadas, canceladas, faturamento }`
- `GET /dash/revenue-daily?month=YYYY-MM`  
  → série diária `{ date, value }`
- `GET /dash/occupancy-by-doctor?start&end`  
  → `%` por médico
- `GET /dash/upcoming-appointments?limit=20`  
  → próximas consultas

---

## Erros & Códigos

- **400**: validação (datas, formatos)
- **401**: não autenticado
- **403**: sem permissão (RBAC)
- **404**: não encontrado
- **409**: conflito (ex.: `slot` não está `LIVRE`)
- **422**: validação Pydantic

**Formato**
```json
{ "detail": "Mensagem clara do problema", "code": "ERR_CODE_OPCIONAL" }
```

---

## Testes

- **Pytest**:  
  - Auth (login/refresh; hash de senha)  
  - Reserva atômica (concorrência, `FOR UPDATE`)  
  - Pagamento simulado  
  - Relatórios agregados
- **Factories** para users/slots/appointments
- Rodar:
```bash
pytest -q
```

---

## Boas Práticas & Segurança

- Hash de senha com `bcrypt`; **nunca** armazene senha em texto puro.
- JWT com `SECRET_KEY` forte; rotação periódica recomendada.
- Limitar campos sensíveis nos responses (ex.: nunca retornar `password_hash`).
- Validar que `doctor_id` sempre pertence a usuário `role='MEDICO'`.
- **LGPD**: CPF e dados pessoais exigem políticas de retenção/consentimento e controles de acesso.

---

## Roadmap

- Integração real de pagamentos (gateway)  
- Notificações (e-mail/SMS) de agendamentos  
- Teleconsulta (links/salas)  
- Logs estruturados e observabilidade  
- Permissões mais granulares por escopo (clínicas/unidades)

---

## Licença

Defina aqui a licença do projeto (ex.: MIT, Apache-2.0).

---

### Exemplos de cURL (rápidos)

**Login**
```bash
curl -X POST http://localhost:8000/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@clinica.local","password":"Admin@123"}'
```

**Criar slot (médico logado)**
```bash
curl -X POST http://localhost:8000/doctors/<doctor_id>/agenda/slots   -H "Authorization: Bearer <ACCESS_TOKEN>"   -H "Content-Type: application/json"   -d '{"slots":[{"inicio":"2025-10-22T09:00:00-03:00","fim":"2025-10-22T10:00:00-03:00"}]}'
```

**Reservar consulta (paciente)**
```bash
curl -X POST http://localhost:8000/appointments   -H "Authorization: Bearer <ACCESS_TOKEN>"   -H "Content-Type: application/json"   -d '{"slot_id":"77777777-7777-7777-7777-777777777701","observacoes":"primeira sessão"}'
```

**Pagar (simulado)**
```bash
curl -X POST http://localhost:8000/payments   -H "Authorization: Bearer <ACCESS_TOKEN>"   -H "Content-Type: application/json"   -d '{"appointment_id":"88888888-8888-8888-8888-888888888881","card_number":"4111111111111111","holder_name":"Carla Paciente","cpf":"33333333333","amount":250.00}'
```

**Faturamento do mês (admin)**
```bash
curl -X GET "http://localhost:8000/reports/admin/revenue?month=2025-10"   -H "Authorization: Bearer <ACCESS_TOKEN>"
```
