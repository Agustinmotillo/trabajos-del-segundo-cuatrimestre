import { Router } from 'express';
import { authRequired } from '../utils/auth.js';
import { pool } from '../index.js';

const r = Router();

// Crear mascota (CLIENTE)
r.post('/', authRequired(['CLIENTE']), async (req, res) => {
  try {
    let { name, species, breed, age } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ ok: false, message: 'Falta el nombre' });
    }

    // Normalizo age: si viene '' o undefined -> NULL
    if (age === '' || age === undefined) age = null;

    const [ins] = await pool.query(
      'INSERT INTO pets (name, species, breed, age, owner_id) VALUES (?,?,?,?,?)',
      [name.trim(), species || null, breed || null, age, req.user.id]
    );

    res.json({ ok: true, id: ins.insertId });
  } catch (e) {
    console.error('POST /pets', e);
    res.status(500).json({ ok: false, message: 'No se pudo crear la mascota' });
  }
});

// Mis mascotas (CLIENTE)
r.get('/my', authRequired(['CLIENTE']), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, species, breed, age FROM pets WHERE owner_id=? ORDER BY id DESC',
      [req.user.id]
    );
    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error('GET /pets/my', e);
    res.status(500).json({ ok: false, message: 'No se pudieron cargar las mascotas' });
  }
});

// Todas las mascotas (RECEPCIONISTA/VETERINARIO)
r.get('/all', authRequired(['RECEPCIONISTA', 'VETERINARIO']), async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.species, p.breed, p.age,
              u.email AS owner_email, u.name AS owner_name
       FROM pets p
       JOIN users u ON u.id = p.owner_id
       ORDER BY p.id DESC`
    );
    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error('GET /pets/all', e);
    res.status(500).json({ ok: false, message: 'No se pudieron cargar las mascotas' });
  }
});

/* ===================== NUEVO ===================== */
/* Datos de una mascota por ID (incluye dueño) */
r.get('/:id', authRequired(['CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.species, p.breed, p.age,
              u.name AS owner_name, u.email AS owner_email
       FROM pets p
       LEFT JOIN users u ON u.id = p.owner_id
       WHERE p.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: 'No existe' });
    res.json({ ok: true, item: rows[0] });
  } catch (e) {
    console.error('GET /pets/:id', e);
    res.status(500).json({ ok: false, message: 'No se pudo cargar la mascota' });
  }
});

/* FICHA completa: mascota + historial clínico + turnos */
r.get('/:id/records', authRequired(['RECEPCIONISTA','VETERINARIO','ADMIN']), async (req, res) => {
  try {
    const petId = Number(req.params.id);

    const [petRows] = await pool.query(
      `SELECT p.id, p.name, p.species, p.breed, p.age,
              u.name AS owner_name, u.email AS owner_email
       FROM pets p
       JOIN users u ON u.id = p.owner_id
       WHERE p.id = ?`,
      [petId]
    );
    if (petRows.length === 0) return res.status(404).json({ ok: false, message: 'Mascota no encontrada' });

    const [records] = await pool.query(
      `SELECT mr.id, mr.pet_id, mr.vet_id, mr.type, mr.description, mr.created_at,
              v.name AS vet_name
       FROM medical_records mr
       LEFT JOIN users v ON v.id = mr.vet_id
       WHERE mr.pet_id = ?
       ORDER BY mr.created_at DESC, mr.id DESC`,
      [petId]
    );

    const [appts] = await pool.query(
      `SELECT a.id, a.pet_id, a.date, a.status
       FROM appointments a
       WHERE a.pet_id = ?
       ORDER BY a.date DESC, a.id DESC`,
      [petId]
    );

    res.json({ ok: true, pet: petRows[0], records, appointments: appts });
  } catch (e) {
    console.error('GET /pets/:id/records', e);
    res.status(500).json({ ok: false, message: 'No se pudo obtener la ficha' });
  }
});

/* Agregar entrada clínica a una mascota */
r.post('/:id/records', authRequired(['VETERINARIO','ADMIN']), async (req, res) => {
  try {
    const petId = Number(req.params.id);
    let { type, description, vaccine } = req.body || {};

    const hasVaccine = vaccine && String(vaccine).trim() !== '';
    if (hasVaccine) {
      type = 'VACUNA';
      description = description && String(description).trim()
        ? `${description} — ${vaccine}`
        : String(vaccine).trim();
    }
    if (!type || !description || !String(description).trim()) {
      return res.status(400).json({ ok: false, message: 'Faltan tipo o descripción' });
    }

    await pool.query(
      `INSERT INTO medical_records (pet_id, vet_id, type, description, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [petId, req.user.id, String(type).toUpperCase(), String(description).trim()]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error('POST /pets/:id/records', e);
    res.status(500).json({ ok: false, message: 'No se pudo guardar el registro clínico' });
  }
});
/* ================================================ */

export default r;
