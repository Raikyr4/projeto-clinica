-- Usuários (Admin, 2 Médicos, 3 Pacientes)
INSERT INTO users (id, nome, email, cpf, password_hash, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin Master', 'admin@clinica.local', '00000000000', crypt('Admin@123', gen_salt('bf')), 'ADMIN'),
  ('22222222-2222-2222-2222-222222222222', 'Dra. Ana Silva', 'ana.silva@clinica.local', '11111111111', crypt('Medico@123', gen_salt('bf')), 'MEDICO'),
  ('33333333-3333-3333-3333-333333333333', 'Dr. Bruno Souza', 'bruno.souza@clinica.local', '22222222222', crypt('Medico@123', gen_salt('bf')), 'MEDICO'),
  ('44444444-4444-4444-4444-444444444444', 'Carla Paciente', 'carla@exemplo.com',   '33333333333', crypt('Paciente@123', gen_salt('bf')), 'PACIENTE'),
  ('55555555-5555-5555-5555-555555555555', 'Diego Paciente', 'diego@exemplo.com',   '44444444444', crypt('Paciente@123', gen_salt('bf')), 'PACIENTE'),
  ('66666666-6666-6666-6666-666666666666', 'Eva Paciente',   'eva@exemplo.com',     '55555555555', crypt('Paciente@123', gen_salt('bf')), 'PACIENTE');

-- Perfis (Admin opcional, Médicos, Pacientes)
INSERT INTO admin_profiles (id, user_id) VALUES
  ('aaaaaaa1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111');

INSERT INTO doctor_profiles (id, user_id, crm_crp, especialidade, bio, valor_padrao_consulta) VALUES
  ('bbbbbbb1-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'CRP 12/3456', 'Terapia Cognitivo-Comportamental', 'Atendimento adulto', 250.00),
  ('bbbbbbb2-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'CRP 34/7890', 'Psicanálise', 'Atendimento adolescentes', 220.00);

INSERT INTO patient_profiles (id, user_id, data_nascimento, telefone, endereco) VALUES
  ('ccccccc1-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', '1992-05-10', '(62)90000-0001', 'Rua A, 123'),
  ('ccccccc2-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', '1988-09-20', '(62)90000-0002', 'Rua B, 456'),
  ('ccccccc3-0000-0000-0000-000000000003', '66666666-6666-6666-6666-666666666666', '1996-02-14', '(62)90000-0003', 'Rua C, 789');

-- Slots (agenda) – exemplos relativos a hoje
-- base_dia = meia-noite de hoje; amanhã 09:00–10:00 e 10:00–11:00 para Ana; 14:00–15:00 para Bruno
WITH base AS (
  SELECT date_trunc('day', now()) + interval '1 day' AS d
)
INSERT INTO schedule_slots (id, doctor_id, inicio, fim, status, created_by)
SELECT * FROM (
  VALUES
    ('77777777-7777-7777-7777-777777777701'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, (SELECT d + time '09:00' FROM base), (SELECT d + time '10:00' FROM base), 'LIVRE'::slot_status, '11111111-1111-1111-1111-111111111111'::uuid),
    ('77777777-7777-7777-7777-777777777702'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, (SELECT d + time '10:00' FROM base), (SELECT d + time '11:00' FROM base), 'LIVRE'::slot_status, '11111111-1111-1111-1111-111111111111'::uuid),
    ('77777777-7777-7777-7777-777777777703'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, (SELECT d + time '14:00' FROM base), (SELECT d + time '15:00' FROM base), 'LIVRE'::slot_status, '11111111-1111-1111-1111-111111111111'::uuid)
) s(id,doctor_id,inicio,fim,status,created_by);

-- Uma consulta já agendada amanhã 09:00 com a Carla
UPDATE schedule_slots
   SET status='RESERVADO'
 WHERE id='77777777-7777-7777-7777-777777777701';

INSERT INTO appointments (id, slot_id, patient_id, status, observacoes)
VALUES ('88888888-8888-8888-8888-888888888881',
        '77777777-7777-7777-7777-777777777701',
        '44444444-4444-4444-4444-444444444444',
        'AGENDADA',
        'Primeira sessão');

-- Pagamento simbólico aprovado para essa consulta
INSERT INTO payments (id, appointment_id, patient_id, valor, status, metodo, nsu_fake, created_at)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        '88888888-8888-8888-8888-888888888881',
        '44444444-4444-4444-4444-444444444444',
        250.00, 'APROVADO', 'CARTAO_FAKE', concat('NSU-', floor(random()*1000000)::text),
        now());

-- Log de auditoria de exemplo
INSERT INTO audit_logs (id, user_id, acao, alvo, payload_json)
VALUES ('adadadad-adad-adad-adad-adadadadad01',
        '11111111-1111-1111-1111-111111111111',
        'SEED', 'INIT', '{"message": "Banco inicializado"}');
