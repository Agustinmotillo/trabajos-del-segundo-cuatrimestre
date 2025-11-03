import { Router } from 'express';
import { authRequired } from '../utils/auth.js';
import { pool } from '../index.js';

const r = Router();

/**
 * Cliente: crear turno
 */
r.post('/', authRequired(['CLIENTE']), async (req, res) => {
  const { pet_id, date, time, reason } = req.body;
  if (!pet_id || !date || !time) {
    return res.status(400).json({ ok: false, message: 'pet_id, date y time son obligatorios' });
  }

  const [ins] = await pool.query(
    'INSERT INTO appointments (pet_id, owner_id, date, time, reason, status) VALUES (?,?,?,?,?,?)',
    [pet_id, req.user.id, date, time, reason || '', 'PENDIENTE']
  );

  res.json({ ok: true, id: ins.insertId });
});

/**
 * Cliente: ver mis turnos
 */
r.get('/my', authRequired(['CLIENTE']), async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM appointments WHERE owner_id=? ORDER BY id DESC',
    [req.user.id]
  );
  res.json({ ok: true, items: rows });
});

/**
 * 🔎 Horarios ocupados por fecha (para armar el selector de horarios)
 * Usa todos los turnos que NO estén RECHAZADOS para bloquearlos.
 * Query: /appointments/booked?date=YYYY-MM-DD
 */
r.get(
  '/booked',
  authRequired(['CLIENTE', 'RECEPCIONISTA', 'VETERINARIO']),
  async (req, res) => {
    try {
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ ok: false, message: 'Parámetro "date" requerido (YYYY-MM-DD)' });
      }

      const [rows] = await pool.query(
        "SELECT time FROM appointments WHERE date = ? AND TRIM(status) <> 'RECHAZADO' ORDER BY time ASC",
        [date]
      );

      res.json({ ok: true, times: rows.map((r) => r.time) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, message: 'Error al obtener horarios ocupados' });
    }
  }
);

/**
 * Recepcionista: ver pendientes
 */
r.get('/pending', authRequired(['RECEPCIONISTA']), async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT a.*, p.name AS pet_name, u.name AS owner_name
     FROM appointments a
     JOIN pets p ON p.id = a.pet_id
     JOIN users u ON u.id = a.owner_id
     WHERE TRIM(a.status) = 'PENDIENTE'
     ORDER BY a.id DESC`
  );
  res.json({ ok: true, items: rows });
});

/**
 * Recepcionista: cambiar estado (ACEPTADO | RECHAZADO)
 */
r.patch('/:id/status', authRequired(['RECEPCIONISTA']), async (req, res) => {
  const { status } = req.body;
  if (!['ACEPTADO', 'RECHAZADO'].includes(status)) {
    return res.status(400).json({ ok: false, message: 'status inválido' });
  }
  await pool.query('UPDATE appointments SET status=? WHERE id=?', [status, req.params.id]);
  res.json({ ok: true });
});

// routes/appointments.js
r.get('/for-vet', authRequired(['VETERINARIO']), async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT a.*, p.name AS pet_name, u.name AS owner_name
     FROM appointments a
     JOIN pets p ON p.id = a.pet_id
     JOIN users u ON u.id = a.owner_id
     WHERE TRIM(a.status) IN ('ACEPTADO','PENDIENTE')   -- <== antes era solo 'ACEPTADO'
     ORDER BY a.id DESC`
  );
  res.json({ ok: true, items: rows });
});


/**
 * Veterinario: finalizar (COMPLETADO | INASISTENCIA)
 */
r.patch('/:id/complete', authRequired(['VETERINARIO']), async (req, res) => {
  const { result } = req.body;
  if (!['COMPLETADO', 'INASISTENCIA'].includes(result)) {
    return res.status(400).json({ ok: false, message: 'result inválido' });
  }
  await pool.query('UPDATE appointments SET status=? WHERE id=?', [result, req.params.id]);
  res.json({ ok: true });
});

export default r;
