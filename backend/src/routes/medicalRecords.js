import { Router } from 'express';
import { authRequired } from '../utils/auth.js';
import { pool } from '../index.js';

const r = Router();

// Vet: agregar registro a historia clínica
r.post('/', authRequired(['VETERINARIO']), async (req,res)=>{
  const { pet_id, type, description } = req.body; // type: VACUNA | NOTA
  await pool.query(
    'INSERT INTO medical_records (pet_id, vet_id, type, description, created_at) VALUES (?,?,?,?,NOW())',
    [pet_id, req.user.id, type, description]
  );
  res.json({ ok:true });
});

export default r;
