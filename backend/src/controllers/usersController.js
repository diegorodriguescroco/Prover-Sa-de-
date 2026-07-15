const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function list(req, res) {
  const { rows } = await pool.query(
    'SELECT id, username, name, unit, role FROM users ORDER BY role DESC, name ASC'
  );
  res.json(rows);
}

async function create(req, res) {
  const { username, name, unit, role = 'attendant', password } = req.body;
  if (!username || !name || !password) {
    return res.status(400).json({ error: 'username, name e password são obrigatórios.' });
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (username, name, unit, role, password_hash) VALUES ($1,$2,$3,$4,$5) RETURNING id, username, name, unit, role',
      [username.trim().toLowerCase(), name.trim(), unit?.trim() || null, role, hash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Usuário já existe.' });
    throw err;
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { name, unit, role, password } = req.body;

  const current = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (!current.rows.length) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const newName = name?.trim() || current.rows[0].name;
  const newUnit = unit !== undefined ? unit?.trim() || null : current.rows[0].unit;
  const newRole = role || current.rows[0].role;

  let newHash = current.rows[0].password_hash;
  if (password) newHash = await bcrypt.hash(password, 10);

  const { rows } = await pool.query(
    'UPDATE users SET name=$1, unit=$2, role=$3, password_hash=$4 WHERE id=$5 RETURNING id, username, name, unit, role',
    [newName, newUnit, newRole, newHash, id]
  );
  res.json(rows[0]);
}

async function remove(req, res) {
  const { id } = req.params;
  if (String(req.user.id) === String(id)) {
    return res.status(400).json({ error: 'Você não pode deletar seu próprio usuário.' });
  }
  const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  if (!rowCount) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ ok: true });
}

module.exports = { list, create, update, remove };
