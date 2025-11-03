# Vet App (Expo + Node/Express + MySQL)

Proyecto de ejemplo listo para correr con **Expo (React Native)** y **Node.js + Express + MySQL** cumpliendo los requisitos: roles (CLIENTE, RECEPCIONISTA, VETERINARIO),
CRUD, autenticación JWT, mensajería cliente↔recepción, turnos, historia clínica, y vistas separadas por rol.

## Requisitos
- Node.js 
- MySQL 
- npm
- Expo (usando `npx expo`/Create Expo App — )

## Pasos rápidos

### 1) Base de datos
Cree una base `vet_app` y ejecute el SQL en `database/seed.sql` (crea tablas + usuarios de prueba).

### 2) Backend
```bash
cd backend
cp .env.example .env

npm install
npm run dev  
# Servidor en http://localhost:4000
```

### 3) Frontend (Expo)
```bash
cd ../frontend
npm install
npx expo start   # elija 'w' para web o use app Android/iOS
```
- La base del API está en `frontend/src/config.ts` (por defecto `http://localhost:4000`).


> Si usa Android Emulator, cambie `API_BASE` a `http://10.0.2.2:4000`. Para dispositivo físico en la misma red, ponga la IP de su PC.

## Estructura

- `backend/` Express + JWT + mysql2 . Rutas: auth, users, pets, appointments, messages, medical-records.
- `frontend/` Expo con React Navigation , Context de Auth, pantallas por rol y componentes responsive.

## Roles y permisos (resumen)
- **CLIENTE**: Mis Mascotas (CRUD básico), Turnos (crear, ver estado), Mensajes (al recepcionista).
- **RECEPCIONISTA**: Turnos pendientes (aceptar/rechazar), Mensajes por cliente (responder), Ver todas las mascotas y dueños.
- **VETERINARIO**: Ver turnos aceptados (marcar COMPLETADO/INASISTENCIA), Historia clínica (agregar registro), Ver fichas de mascotas y su historial.

## Notas
- JWT de acceso expira a 2h, refresh 7d (endpoints `/auth/refresh`).

