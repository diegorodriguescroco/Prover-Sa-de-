require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('../config/db');

const users = [
  { username: 'admin', password: 'prover2024', name: 'Administrador', unit: '',               role: 'admin' },
  { username: 'maria', password: 'atend1',     name: 'Maria Silva',   unit: 'Unidade Centro', role: 'attendant' },
  { username: 'joana', password: 'atend2',     name: 'Joana Pereira', unit: 'Unidade Norte',  role: 'attendant' },
  { username: 'carla', password: 'atend3',     name: 'Carla Mendes',  unit: 'Unidade Sul',    role: 'attendant' },
];

async function seed() {
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users (username, password_hash, name, unit, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING`,
      [u.username, hash, u.name, u.unit, u.role]
    );
    console.log(`✅ Usuário: ${u.username}`);
  }
  console.log('Seed concluído.');
  await pool.end();
}

seed().catch(err => { console.error('❌ Erro no seed:', err.message); process.exit(1); });
