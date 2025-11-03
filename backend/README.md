# Backend - Vet App (Node.js + Express + MySQL)

API en `http://localhost:4000`

## Usuarios demo
- cliente@example.com / **123456** (CLIENTE)
- recepcion@example.com / **123456** (RECEPCIONISTA)
- vet@example.com / **123456** (VETERINARIO)

## Autenticación
- `POST /api/auth/register` (name, email, password, role)

## Endpoints principales
- **Mascotas** `/api/pets` (CLIENTE crea/borra, VETERINARIO puede listar todas)
- **Turnos** `/api/appointments` (CLIENTE crea; RECEPCIONISTA confirma/rechaza; VETERINARIO completa)
- **Historia clínica** `/api/records` (solo VETERINARIO crea; CLIENTE y VETERINARIO consultan)
- **Mensajes** `/api/messages` (CLIENTE ↔ RECEPCIONISTA)



# Documentación del Backend del Proyecto Integrador

Backend de la aplicación **Vet App**, desarrollado en **Node.js + Express** con base de datos **MySQL** y autenticación mediante **JWT**.

---

## 1. Tecnologías utilizadas

- **Node.js** + **Express**
- **MySQL** (`mysql2/promise`)
- **JWT** (`jsonwebtoken`)
- **bcryptjs** (hash de contraseñas)
- **dotenv** (variables de entorno)
- **cors**

---

## 2. Estructura general del backend

Archivos principales:

- `index.js` → punto de entrada del servidor Express
- `utils/auth.js` → helpers de JWT y middleware `authRequired`
- `routes/auth.js` → autenticación (registro / login) *(definido en el proyecto, aunque no esté en esta carpeta de ejemplo)*
- `routes/users.js` → endpoints de usuarios
- `routes/pets.js` → endpoints de mascotas
- `routes/appointments.js` → endpoints de turnos
- `routes/messages.js` → chat / mensajes
- `routes/medicalRecords.js` → registros clínicos

En `index.js` se montan así:

```js
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/pets', petRoutes);
app.use('/appointments', apptRoutes);
app.use('/messages', msgRoutes);
app.use('/medical-records', medRoutes);
```

---

## 3. Configuración y ejecución

### 3.1. Variables de entorno (`.env`)

Ejemplo (según `.env`):

```env
PORT=4000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=vet_app
DB_PORT=3306

JWT_SECRET=supersecreto
JWT_REFRESH_SECRET=supersecreto_refresco
CORS_ORIGIN=http://localhost:5173
```

### 3.2. Scripts (package.json)

- `npm install` → instala dependencias
- `npm start` o `node src/index.js` (según cómo esté configurado el proyecto) → arranca el backend

---

## 4. Autenticación y middleware

### 4.1. JWT y `authRequired`

Definido en `utils/auth.js`:

```js
import jwt from 'jsonwebtoken';

export function signAccess(payload){
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn:'2h' });
}
export function signRefresh(payload){
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn:'7d' });
}
export function authRequired(roles=[]){
  return (req,res,next)=>{
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if(!token) return res.status(401).json({ok:false, message:'No token'});
    try{
      const data = jwt.verify(token, process.env.JWT_SECRET);
      if(roles.length && !roles.includes(data.role)) {
        return res.status(403).json({ok:false, message:'Sin permiso'});
      }
      req.user = data;
      next();
    }catch(e){
      return res.status(401).json({ok:false, message:'Token inválido'});
    }
  }
}
```

- El cliente debe enviar el header:  
  `Authorization: Bearer <token_jwt>`
- Si el usuario no tiene alguno de los roles requeridos, se devuelve **403 Sin permiso**.

---

## 5. Endpoints de la API

### 5.1. Autenticación (`/auth`)

> **Nota:** Este archivo está en `routes/auth.js` en el proyecto original.

#### POST `/auth/register`

Registra un usuario nuevo.

- **Body (JSON):**
  - `name` (string, obligatorio)
  - `email` (string, obligatorio, único)
  - `password` (string, obligatorio)
  - `role` (por defecto `'CLIENTE'`)

- **Respuesta 200 (OK):**

```json
{
  "ok": true,
  "user": {
    "id": 1,
    "name": "Juan Perez",
    "email": "juan@example.com",
    "role": "CLIENTE"
  }
}
```

- **Errores:**
  - 409 → `{ ok:false, message:'Email ya registrado' }`
  - 500 → `{ ok:false, message:'Error' }`

---

#### POST `/auth/login`

Inicia sesión con email y contraseña.

- **Body (JSON):**
  - `email` (string)
  - `password` (string)

- **Respuesta 200 (OK):**

```json
{
  "ok": true,
  "token": "<jwt_access>",
  "refresh": "<jwt_refresh>",
  "user": {
    "id": 1,
    "name": "Juan Perez",
    "email": "juan@example.com",
    "role": "CLIENTE"
  }
}
```

- **Errores:**
  - 401 → `{ ok:false, message:'Credenciales inválidas' }`
  - 500 → `{ ok:false, message:'Error' }`

---

#### POST `/auth/refresh`

No implementado, devuelve:

- 501 → `{ ok:false, message:'No implementado' }`

---

### 5.2. Usuarios (`/users`)

Definido en `routes/users.js`.

#### GET `/users/pets-all`

- **Roles permitidos:** `['RECEPCIONISTA']`
- Devuelve todas las mascotas con datos de dueño (pensado para Recepcionista).

- **Respuesta 200:**

```json
{
  "ok": true,
  "items": [
    {
      "id": 1,
      "name": "Firulais",
      "species": "Perro",
      "breed": "Caniche",
      "age": 3,
      "owner_id": 10,
      "owner_name": "Juan Perez",
      "owner_email": "juan@example.com"
    },
    ...
  ]
}
```

---

#### GET `/users/clients`

- **Roles permitidos:** `['RECEPCIONISTA', 'ADMIN', 'VETERINARIO']`
- Lista usuarios con rol **CLIENTE**.

- **Respuesta 200:**

```json
{
  "ok": true,
  "items": [
    { "id": 1, "name": "Juan Perez", "email": "juan@example.com", "role": "CLIENTE" }
  ]
}
```

---

#### GET `/users/recepcionistas`

- **Roles permitidos:** `['CLIENTE', 'RECEPCIONISTA', 'ADMIN', 'VETERINARIO']`
- Lista usuarios con rol **RECEPCIONISTA** (útil para iniciar chat).

---

#### GET `/users?role=CLIENTE|RECEPCIONISTA|VETERINARIO`

- **Roles permitidos:** `['CLIENTE', 'RECEPCIONISTA', 'ADMIN', 'VETERINARIO']`
- Parámetro query:
  - `role` (obligatorio): `CLIENTE`, `RECEPCIONISTA` o `VETERINARIO`.

- **Errores:**
  - 400 → falta `role` o rol no soportado.
  - 500 → error interno.

---

### 5.3. Mascotas (`/pets`)

Definido en `routes/pets.js`.

#### POST `/pets`

Crear mascota (CLIENTE).

- **Roles:** `['CLIENTE']`
- **Body:**
  - `name` (string, obligatorio)
  - `species` (string, opcional)
  - `breed` (string, opcional)
  - `age` (number o string, opcional; `''` o `undefined` → `NULL`)

- **Respuesta 200:**

```json
{ "ok": true, "id": 5 }
```

- **Errores:**
  - 400 → falta nombre
  - 500 → error en BD

---

#### GET `/pets/my`

Lista las mascotas del **cliente logueado**.

- **Roles:** `['CLIENTE']`
- **Respuesta 200:**

```json
{
  "ok": true,
  "items": [
    { "id":1, "name":"Firulais", "species":"Perro", "breed":"Caniche", "age":3 },
    ...
  ]
}
```

---

#### GET `/pets/all`

Lista todas las mascotas (para Recepcionista y Veterinario).

- **Roles:** `['RECEPCIONISTA', 'VETERINARIO']`

- **Respuesta 200:**

```json
{
  "ok": true,
  "items": [
    {
      "id": 1,
      "name": "Firulais",
      "species": "Perro",
      "breed": "Caniche",
      "age": 3,
      "owner_email": "juan@example.com",
      "owner_name": "Juan Perez"
    },
    ...
  ]
}
```

---

#### GET `/pets/:id`

Datos de una mascota específica, incluyendo datos de dueño.

- **Roles:** `['CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMIN']`
- **Params:**
  - `id` → ID de mascota

- **Respuesta 200:**

```json
{
  "ok": true,
  "item": {
    "id": 1,
    "name": "Firulais",
    "species": "Perro",
    "breed": "Caniche",
    "age": 3,
    "owner_name": "Juan Perez",
    "owner_email": "juan@example.com"
  }
}
```

- **Errores:**
  - 404 → `{ ok:false, message:'No existe' }`
  - 500 → error en BD

---

#### GET `/pets/:id/records`

Historia clínica + turnos de una mascota (vista para Detalle de Mascota).

- **Roles:** `['CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMIN']`
- **Respuesta 200:**

```json
{
  "ok": true,
  "pet": { ...datos de la mascota... },
  "records": [
    {
      "id": 10,
      "type": "VACUNA",
      "description": "Vacuna antirrábica",
      "created_at": "2025-01-01T10:00:00.000Z",
      "vet_name": "Dra. Pérez"
    }
  ],
  "appointments": [
    {
      "id": 3,
      "date": "2025-01-10",
      "time": "09:40:00",
      "status": "ACEPTADO",
      "reason": "Vacunación"
    }
  ]
}
```

---

#### POST `/pets/:id/records`

Crear un nuevo registro en la historia clínica.

- **Roles:** `['VETERINARIO']`
- **Body:**
  - `type` (string) → por ejemplo `VACUNA` o `NOTA`
  - `description` (string) → texto/nota
  - `vaccine` (string, opcional) → nombre de la vacuna

- **Respuesta 200:**
  ```json
  { "ok": true, "id": 123 }
  ```

---

### 5.4. Turnos (`/appointments`)

Definido en `routes/appointments.js`.

#### POST `/appointments`

Crear turno (CLIENTE).

- **Roles:** `['CLIENTE']`
- **Body:**
  - `pet_id` (number, obligatorio)
  - `date` (string, `YYYY-MM-DD`, obligatorio)
  - `time` (string, `HH:mm`, obligatorio)
  - `reason` (string, opcional)

- Se guarda con `status = 'PENDIENTE'`.

- **Errores:**
  - 400 → falta `pet_id`, `date` o `time`.

---

#### GET `/appointments/my`

Ver turnos del cliente logueado.

- **Roles:** `['CLIENTE']`

---

#### GET `/appointments/booked?date=YYYY-MM-DD`

Devuelve horarios ocupados en una fecha determinada (no cuenta los `RECHAZADO`).

- **Roles:** `['CLIENTE', 'RECEPCIONISTA', 'VETERINARIO']`
- **Query:**
  - `date` (obligatorio, `YYYY-MM-DD`)

- **Respuesta 200:**

```json
{
  "ok": true,
  "times": ["08:00", "08:20", "09:00"]
}
```

- **Errores:**
  - 400 → falta `date`
  - 500 → error interno

---

#### GET `/appointments/pending`

Turnos **pendientes** para Recepcionista.

- **Roles:** `['RECEPCIONISTA']`
- Incluye:
  - datos de mascota (`pet_name`)
  - datos de dueño (`owner_name`)

---

#### PATCH `/appointments/:id/status`

Cambiar estado de turno (Recepcionista).

- **Roles:** `['RECEPCIONISTA']`
- **Body:**
  - `status` → `'ACEPTADO'` o `'RECHAZADO'`

- **Errores:**
  - 400 → `status inválido`

---

#### GET `/appointments/for-vet`

Turnos **aceptados** para Veterinario.

- **Roles:** `['VETERINARIO']`
- Muestra la lista de turnos con datos de mascota y dueño.

---

#### PATCH `/appointments/:id/complete`

Finalizar turno (Veterinario).

- **Roles:** `['VETERINARIO']`
- **Body:**
  - `result` → `'COMPLETADO'` o `'INASISTENCIA'`

- **Errores:**
  - 400 → `result inválido`

---

### 5.5. Mensajes / Chat (`/messages`)

Definido en `routes/messages.js`.

> **Todos los endpoints usan `authRequired`**, por lo que el usuario debe estar logueado.

#### POST `/messages`

Enviar mensaje.

- **Body:**
  - `to_id` (number) → id del usuario destinatario
  - `text` (string, obligatorio) → contenido del mensaje

- **Respuesta 200:**

```json
{ "ok": true, "id": 123 }
```

---

#### GET `/messages/my`

Lista de “conversaciones” o mensajes relacionados al usuario logueado.

*(La estructura exacta depende de la consulta en `messages.js`, pero siempre filtrando por `from_id = req.user.id` o `to_id = req.user.id`.)*

---

#### GET `/messages/between/:otherId`

Mensajes entre el usuario logueado y `otherId`.

- **Params:**
  - `otherId` → id del otro usuario.

---

#### GET `/messages/unread/for-me`

Cantidad de mensajes no leídos para el usuario logueado.

- **Respuesta 200:**

```json
{ "ok": true, "total": 3 }
```

Usado para mostrar el “badge” de no leídos en el frontend.

---

#### PATCH `/messages/mark-read`

Marca mensajes como leídos para una conversación.

- **Body:**
  - `from_id` (number) → id de la contraparte cuya conversación se quiere marcar como leída.

---

### 5.6. Registros clínicos (`/medical-records`)

Definido en `routes/medicalRecords.js`.

> En la versión actual del backend, se usa principalmente para crear registros.  
> La lectura de la historia clínica se hace vía `/pets/:id/records`.

#### POST `/medical-records`

Agregar registro a la historia clínica.

- **Roles:** `['VETERINARIO']`
- **Body:**
  - `pet_id` (number)
  - `type` (string) → por ejemplo `VACUNA`, `NOTA`
  - `description` (string) → descripción / diagnóstico

- Inserta un registro en la tabla `medical_records` con `vet_id = req.user.id` y `created_at = NOW()`.

- **Respuesta 200:**
  ```json
  { "ok": true }
  ```

---

## 6. Códigos de estado (resumen)

- **200 OK** → operación exitosa.
- **400 Bad Request** → parámetros faltantes o inválidos.
- **401 Unauthorized** → no hay token o es inválido.
- **403 Forbidden** → el rol del usuario no tiene permiso.
- **404 Not Found** → recurso no encontrado (por ejemplo, mascota inexistente).
- **409 Conflict** → conflicto (por ejemplo, email ya registrado).
- **500 Internal Server Error** → error de servidor / base de datos.
- **501 Not Implemented** → funcionalidad declarada pero no implementada (como `/auth/refresh`).

---

## 7. Notas finales

- Toda la API devuelve objetos JSON con la clave booleana `ok` indicando si la operación fue exitosa.
- El frontend utiliza el campo `role` del usuario (`CLIENTE`, `RECEPCIONISTA`, `VETERINARIO`, `ADMIN`) para mostrar u ocultar pantallas.
- Para probar los endpoints se recomienda usar Postman / Insomnia enviando siempre el header:

```http
Authorization: Bearer <token>
Content-Type: application/json
```
