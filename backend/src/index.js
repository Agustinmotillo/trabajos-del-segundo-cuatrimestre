import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import { createPool } from 'mysql2/promise';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import petRoutes from './routes/pets.js';
import apptRoutes from './routes/appointments.js';
import msgRoutes from './routes/messages.js';
import medRoutes from './routes/medicalRecords.js';

const app = express();

const origins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
app.use(cors({ origin: (origin, cb)=> cb(null, true), credentials:true })); // laxo para pruebas
app.use(express.json());

export const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10
});

// health
app.get('/health', (req,res)=>res.json({ok:true}));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/pets', petRoutes);
app.use('/appointments', apptRoutes);
app.use('/messages', msgRoutes);
app.use('/medical-records', medRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`✅ Backend en http://localhost:${PORT}`));
