const pool = require('../config/db');

// POST /api/records — atendente registra um cliente
async function create(req, res, next) {
  try {
    const { id, name, unit } = req.user;
    const now  = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 8);

    const { rows } = await pool.query(
      `INSERT INTO records (user_id, name, unit, date, time)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, name, unit, date, time]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/records/:id — atendente desfaz seu próprio registro
async function remove(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM records WHERE id = $1',
      [req.params.id]
    );
    const record = rows[0];
    if (!record) return res.status(404).json({ error: 'Registro não encontrado.' });

    // atendente só pode deletar registro próprio; admin pode deletar qualquer um
    if (req.user.role !== 'admin' && record.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para remover este registro.' });
    }

    await pool.query('DELETE FROM records WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/records/today — contador do dia para o atendente
async function today(req, res, next) {
  try {
    const date = new Date().toISOString().slice(0, 10);
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS count FROM records WHERE user_id = $1 AND date = $2',
      [req.user.id, date]
    );
    res.json({ count: parseInt(rows[0].count, 10), date });
  } catch (err) {
    next(err);
  }
}

// GET /api/records — admin: todos os registros com filtros
async function list(req, res, next) {
  try {
    const { unit, attendant, from, to } = req.query;
    const conditions = [];
    const params     = [];
    let p = 1;

    if (unit)      { conditions.push(`r.unit = $${p++}`);         params.push(unit); }
    if (attendant) { conditions.push(`r.name = $${p++}`);         params.push(attendant); }
    if (from)      { conditions.push(`r.date >= $${p++}`);        params.push(from); }
    if (to)        { conditions.push(`r.date <= $${p++}`);        params.push(to); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const { rows } = await pool.query(
      `SELECT r.id, r.name, r.unit, r.date::text, r.time::text, r.created_at
       FROM records r
       ${where}
       ORDER BY r.created_at DESC
       LIMIT 2000`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/records/summary — admin: totais por atendente e por unidade
async function summary(req, res, next) {
  try {
    const { from, to } = req.query;
    const conditions = [];
    const params     = [];
    let p = 1;
    if (from) { conditions.push(`date >= $${p++}`); params.push(from); }
    if (to)   { conditions.push(`date <= $${p++}`); params.push(to); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [byAtt, byUnit, total] = await Promise.all([
      pool.query(`SELECT name, COUNT(*)::int AS count FROM records ${where} GROUP BY name ORDER BY count DESC`, params),
      pool.query(`SELECT unit, COUNT(*)::int AS count FROM records ${where} GROUP BY unit ORDER BY count DESC`, params),
      pool.query(`SELECT COUNT(*)::int AS count FROM records ${where}`, params),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const todayWhere = conditions.length
      ? where + ` AND date = '${today}'`
      : `WHERE date = '${today}'`;
    const { rows: todayRows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM records ${todayWhere}`, params
    );

    res.json({
      total:   total.rows[0].count,
      today:   todayRows[0].count,
      byAtt:   byAtt.rows,
      byUnit:  byUnit.rows,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, remove, today, list, summary };
