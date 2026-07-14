-- Schema Prover Saúde — Sistema de Registro de Clientes

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50)  UNIQUE NOT NULL,
  password_hash TEXT       NOT NULL,
  name       VARCHAR(100) NOT NULL,
  unit       VARCHAR(100) NOT NULL DEFAULT '',
  role       VARCHAR(20)  NOT NULL DEFAULT 'attendant' CHECK (role IN ('admin', 'attendant')),
  active     BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS records (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  unit       VARCHAR(100) NOT NULL,
  date       DATE         NOT NULL,
  time       TIME         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_date    ON records(date);
CREATE INDEX IF NOT EXISTS idx_records_unit    ON records(unit);
