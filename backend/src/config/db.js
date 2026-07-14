const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres.ljblcuwlwejbsyepnhal',
  password: '*Diego2005***',
  host: 'aws-0-ca-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do banco:', err.message);
});

module.exports = pool;