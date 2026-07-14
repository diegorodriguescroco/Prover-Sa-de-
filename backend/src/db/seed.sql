-- Seed Prover Saúde
-- Usa pgcrypto para gerar hashes bcrypt reais — disponível nativamente no Supabase.
-- Execute no SQL Editor do Supabase após rodar o schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (username, password_hash, name, unit, role) VALUES
  ('admin',  crypt('prover2024', gen_salt('bf', 10)), 'Administrador',  '',              'admin'),
  ('maria',  crypt('atend1',     gen_salt('bf', 10)), 'Maria Silva',    'Unidade Centro','attendant'),
  ('joana',  crypt('atend2',     gen_salt('bf', 10)), 'Joana Pereira',  'Unidade Norte', 'attendant'),
  ('carla',  crypt('atend3',     gen_salt('bf', 10)), 'Carla Mendes',   'Unidade Sul',   'attendant')
ON CONFLICT (username) DO NOTHING;
