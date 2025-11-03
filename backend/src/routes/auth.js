// backend/src/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../index.js';
import { signAccess, signRefresh } from '../utils/auth.js';

const r = Router();

/* ----------- Registro normal (email / password) ----------- */
r.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'CLIENTE' } = req.body;

    const [ex] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
    if (ex.length) {
      return res
        .status(409)
        .json({ ok: false, message: 'Email ya registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [ins] = await pool.query(
      'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
      [name, email, hash, role]
    );

    const user = { id: ins.insertId, name, email, role };
    return res.json({ ok: true, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: 'Error' });
  }
});

/* ----------- Login normal (email / password) ----------- */
r.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [
      email,
    ]);
    if (!rows.length) {
      return res
        .status(401)
        .json({ ok: false, message: 'Credenciales inválidas' });
    }

    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password || '');
    if (!ok) {
      return res
        .status(401)
        .json({ ok: false, message: 'Credenciales inválidas' });
    }

    const payload = { id: u.id, name: u.name, email: u.email, role: u.role };
    const access = signAccess(payload);
    const refresh = signRefresh(payload);

    res.json({ ok: true, token: access, refresh, user: payload });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: 'Error' });
  }
});

/* ----------- Refresh (no lo usamos de momento) ----------- */
r.post('/refresh', async (_req, res) => {
  res.status(501).json({ ok: false, message: 'No implementado' });
});

r.get('/me', async (_req, res) => {
  res.json({ ok: true });
});

/* ----------- Login / registro con Google ----------- */
/**
 * Espera: { accessToken?, idToken? }
 * - Con accessToken: pide el perfil a https://www.googleapis.com/oauth2/v3/userinfo
 * - Con idToken: usa https://oauth2.googleapis.com/tokeninfo?id_token=...
 * Usa el email de Google para crear / buscar el usuario y devuelve JWT igual que /login
 */
r.post('/google/token', async (req, res) => {
  try {
    const { accessToken, idToken } = req.body || {};

    if (!accessToken && !idToken) {
      return res
        .status(400)
        .json({ ok: false, message: 'Falta token de Google' });
    }

    // ---- 1) Obtener perfil desde Google ----
    let profile = null;

    if (accessToken) {
      // usamos el access token que te devuelve useGoogleLogin
      const resp = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!resp.ok) {
        console.error('Google userinfo error:', await resp.text());
        return res
          .status(400)
          .json({ ok: false, message: 'No se pudo leer datos de Google' });
      }

      const info = await resp.json();
      if (!info.email) {
        return res
          .status(400)
          .json({ ok: false, message: 'Google no devolvió email' });
      }

      profile = {
        email: info.email,
        name:
          info.name ||
          info.given_name ||
          info.email.split('@')[0] ||
          'Usuario Google',
      };
    } else if (idToken) {
      // camino alternativo por si algún día mandamos idToken
      const resp = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
          idToken
        )}`
      );

      if (!resp.ok) {
        console.error('Google tokeninfo error:', await resp.text());
        return res
          .status(400)
          .json({ ok: false, message: 'No se pudo validar idToken' });
      }

      const info = await resp.json();
      if (!info.email) {
        return res
          .status(400)
          .json({ ok: false, message: 'Google no devolvió email' });
      }

      profile = {
        email: info.email,
        name:
          info.name ||
          info.given_name ||
          info.email.split('@')[0] ||
          'Usuario Google',
      };
    }

    // seguridad extra
    if (!profile) {
      return res
        .status(400)
        .json({ ok: false, message: 'Perfil de Google vacío' });
    }

    const { email, name } = profile;

    // ---- 2) Buscar o crear usuario en tu BD ----
    const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [
      email,
    ]);

    let user;
    if (rows.length) {
      const u = rows[0];
      user = { id: u.id, name: u.name, email: u.email, role: u.role };
    } else {
      // nuevo cliente que entra con Google
      const [ins] = await pool.query(
        'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
        [name, email, '', 'CLIENTE']
      );
      user = { id: ins.insertId, name, email, role: 'CLIENTE' };
    }

    // ---- 3) Generar JWT igual que en /login ----
    const access = signAccess(user);
    const refresh = signRefresh(user);

    return res.json({ ok: true, token: access, refresh, user });
  } catch (e) {
    console.error('Error en /auth/google/token:', e);
    res
      .status(500)
      .json({ ok: false, message: 'Error al procesar login con Google' });
  }
});

export default r;
