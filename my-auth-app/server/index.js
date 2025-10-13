import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { pool } from "./db.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Ruta simple para probar
app.get("/health", (_req, res) => res.json({ ok: true }));

// Endpoint de login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("📩 Datos recibidos del frontend:", { email, password });


    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Faltan datos." });
    }

    const [rows] = await pool.query(
      "SELECT id, nombre, email, password_hash FROM users WHERE TRIM(email) = TRIM(?) LIMIT 1",
      [email]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ ok: false, message: "Usuario no encontrado." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ ok: false, message: "Contraseña incorrecta." });
    }

    return res.json({
      ok: true,
      user: { id: user.id, nombre: user.nombre, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Error interno del servidor." });
  }
});

// 🔎 Ver qué usuario ve el servidor (para diagnóstico)
app.get("/dev/user", async (req, res) => {
  try {
    const { email } = req.query; // usar ?email=agustin@test.com
    const [rows] = await pool.query(
      "SELECT id, nombre, email, password_hash FROM users WHERE TRIM(email) = TRIM(?) LIMIT 1",
      [email]
    );
    return res.json({ ok: true, rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "Error en /dev/user" });
  }
});

// 🛠️ Resetear la contraseña directamente desde Node (sin tocar la BD a mano)
app.post("/dev/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ ok: false, message: "Falta email o contraseña nueva." });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      "UPDATE users SET password_hash = ? WHERE TRIM(email) = TRIM(?)",
      [hash, email]
    );

    return res.json({
      ok: true,
      affectedRows: result.affectedRows,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "Error en /dev/reset-password" });
  }
});

// 👉 Endpoint para generar hash nuevo (solo temporal)
app.get("/dev/hash", async (req, res) => {
  try {
    const hash = await bcrypt.hash("1234", 10);
    console.log("🔑 Nuevo hash generado:", hash);
    res.json({ ok: true, hash });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
