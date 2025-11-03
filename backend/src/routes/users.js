// backend/src/routes/users.js
import { Router } from 'express';
import { authRequired } from '../utils/auth.js';
import { pool } from '../index.js';

const r = Router();

/**
 * Para recepcionista: ver todas las mascotas con dueños
 * GET /users/pets-all
 */
r.get('/pets-all', authRequired(['RECEPCIONISTA']), async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, u.name AS owner_name, u.email AS owner_email
      FROM pets p
      JOIN users u ON u.id = p.owner_id
      ORDER BY p.id DESC
    `);
    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: 'Error al listar mascotas' });
  }
});

/**
 * Listar usuarios de rol CLIENTE (para Recepcionista / Admin / Vet).
 * GET /users/clients
 */
r.get(
  '/clients',
  authRequired(['RECEPCIONISTA', 'ADMIN', 'VETERINARIO']),
  async (_req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, name, email, role
         FROM users
         WHERE role = 'CLIENTE'
         ORDER BY name ASC`
      );
      res.json({ ok: true, items: rows });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, message: 'Error al listar clientes' });
    }
  }
);

/**
 * Listar usuarios de rol RECEPCIONISTA (los clientes necesitan esto para abrir chat).
 * GET /users/recepcionistas
 */
r.get(
  '/recepcionistas',
  // 👇 Permitimos también CLIENTE porque el cliente debe poder ver a quién escribir.
  authRequired(['CLIENTE', 'RECEPCIONISTA', 'ADMIN', 'VETERINARIO']),
  async (_req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, name, email, role
         FROM users
         WHERE role = 'RECEPCIONISTA'
         ORDER BY name ASC`
      );
      res.json({ ok: true, items: rows });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, message: 'Error al listar recepcionistas' });
    }
  }
);

/**
 * Endpoint genérico con ?role=
 * Soporta role=CLIENTE | RECEPCIONISTA | VETERINARIO
 * GET /users?role=CLIENTE
 */
r.get(
  '/',
  authRequired(['CLIENTE', 'RECEPCIONISTA', 'ADMIN', 'VETERINARIO']),
  async (req, res) => {
    try {
      const role = (req.query.role || '').toString().toUpperCase().trim();
      if (!role) {
        return res
          .status(400)
          .json({ ok: false, message: 'Falta parámetro role.' });
      }
      // Seguridad: solo roles permitidos
      const allowed = new Set(['CLIENTE', 'RECEPCIONISTA', 'VETERINARIO']);
      if (!allowed.has(role)) {
        return res
          .status(400)
          .json({ ok: false, message: 'Parámetro role no soportado.' });
      }

      const [rows] = await pool.query(
        `SELECT id, name, email, role
         FROM users
         WHERE role = ?
         ORDER BY name ASC`,
        [role]
      );
      res.json({ ok: true, items: rows });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, message: 'Error al procesar la solicitud' });
    }
  }
);

export default r;
