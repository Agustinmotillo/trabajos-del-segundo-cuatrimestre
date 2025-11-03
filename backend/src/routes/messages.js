import { Router } from 'express';
import { authRequired } from '../utils/auth.js';
import { pool } from '../index.js';

const r = Router();

function normText(v, max = 1000) {
  const s = (v ?? '').toString().trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

r.post(
  '/',
  authRequired(['CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMIN']),
  async (req, res) => {
    try {
      const fromId = req.user.id;
      const toUserId = req.body?.to_user_id != null ? Number(req.body.to_user_id) : null;
      const toRole = req.body?.to_role ? String(req.body.to_role).toUpperCase() : null;

      // acepta text o message
      const clean = normText(req.body?.text ?? req.body?.message);
      if (!clean) return res.status(400).json({ ok: false, message: 'El mensaje está vacío.' });
      if (!toUserId && !toRole) {
        return res.status(400).json({ ok: false, message: 'Falta destinatario (to_user_id o to_role).' });
      }

      if (toUserId) {
        const [ins] = await pool.query(
          `INSERT INTO messages (from_user_id, to_user_id, message, leido, is_read, created_at)
           VALUES (?,?,?,?,?, NOW())`,
          [fromId, toUserId, clean, 0, 0]
        );
        return res.status(201).json({ ok: true, id: ins.insertId });
      }

      const [ins] = await pool.query(
        `INSERT INTO messages (from_user_id, to_role, message, leido, is_read, created_at)
         VALUES (?,?,?,?,?, NOW())`,
        [fromId, toRole, clean, 0, 0]
      );
      return res.status(201).json({ ok: true, id: ins.insertId });
    } catch (e) {
      console.error('POST /messages error:', e);
      return res.status(500).json({ ok: false, message: 'Error al enviar mensaje.' });
    }
  }
);

r.get(
  '/with/:otherId',
  authRequired(['CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMIN']),
  async (req, res) => {
    try {
      const me = req.user.id;
      const other = Number(req.params.otherId);
      const [rows] = await pool.query(
        `SELECT id,
                from_user_id AS from_id,
                to_user_id   AS to_id,
                message      AS text,
                created_at
         FROM messages
         WHERE (from_user_id=? AND to_user_id=?)
            OR (from_user_id=? AND to_user_id=?)
         ORDER BY created_at ASC, id ASC`,
        [me, other, other, me]
      );
      return res.json({ ok: true, items: rows });
    } catch (e) {
      console.error('GET /messages/with error:', e);
      return res.status(500).json({ ok: false, message: 'Error al obtener hilo.' });
    }
  }
);
  

// === UNREAD COUNTS ===
// Total y por remitente para el usuario autenticado.
// Para RECEPCIONISTA considera DM directos (to_user_id = me) y mensajes a rol (to_role='RECEPCIONISTA').
r.get('/unread/for-me', authRequired(['CLIENTE','RECEPCIONISTA','VETERINARIO','ADMIN']), async (req,res)=>{
  try{
    const me = req.user.id;
    const myRole = req.user.role;

    // Total
    const [totalRows] = await pool.query(
      myRole === 'RECEPCIONISTA'
        ? `SELECT COUNT(*) AS n
           FROM messages
           WHERE is_read=0 AND (to_user_id=? OR to_role='RECEPCIONISTA')`
        : `SELECT COUNT(*) AS n
           FROM messages
           WHERE is_read=0 AND to_user_id=?`,
      [me]
    );
    const total = Number(totalRows?.[0]?.n || 0);

    // Por remitente (para pintar el badge por chat)
    const [bySender] = await pool.query(
      myRole === 'RECEPCIONISTA'
        ? `SELECT from_user_id AS user_id, COUNT(*) AS n
           FROM messages
           WHERE is_read=0 AND (to_user_id=? OR to_role='RECEPCIONISTA')
           GROUP BY from_user_id
           ORDER BY n DESC`
        : `SELECT from_user_id AS user_id, COUNT(*) AS n
           FROM messages
           WHERE is_read=0 AND to_user_id=?
           GROUP BY from_user_id
           ORDER BY n DESC`,
      [me]
    );

    res.json({ ok:true, total, by_sender: bySender });
  }catch(e){
    console.error(e);
    res.status(500).json({ ok:false, message:'Error al contar no leídos' });
  }
});

// === MARK READ ===
// Marca como leídos los mensajes del "otro" hacia mí.
// Para RECEPCIONISTA también marca los que vinieron a to_role='RECEPCIONISTA'.
r.post('/mark-read/:otherId', authRequired(['CLIENTE','RECEPCIONISTA','VETERINARIO','ADMIN']), async (req,res)=>{
  try{
    const me = req.user.id;
    const myRole = req.user.role;
    const other = Number(req.params.otherId);

    // DM directos hacia mí
    await pool.query(
      `UPDATE messages
       SET is_read=1
       WHERE is_read=0 AND from_user_id=? AND to_user_id=?`,
      [other, me]
    );

    // Mensajes al rol RECEPCIONISTA (si soy recep)
    if (myRole === 'RECEPCIONISTA'){
      await pool.query(
        `UPDATE messages
         SET is_read=1
         WHERE is_read=0 AND from_user_id=? AND to_role='RECEPCIONISTA'`,
        [other]
      );
    }

    res.json({ ok:true });
  }catch(e){
    console.error(e);
    res.status(500).json({ ok:false, message:'No se pudieron marcar como leídos' });
  }
});


export default r;
