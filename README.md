# SIGEJOD Backend API

API REST del **Sistema de Gestión Escolar SIGEJOD**. El backend centraliza la
administración de docentes, tutores, alumnos, grupos, materias, calificaciones
y notificaciones escolares mediante una arquitectura desacoplada de
Node.js/Express y PostgreSQL.

[![Node.js](https://img.shields.io/badge/Node.js-runtime-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.37.7-52B0E7?logo=sequelize&logoColor=white)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-supported-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Security](https://img.shields.io/badge/security-JWT%20%7C%20Helmet%20%7C%20RBAC-blue)](#arquitectura-de-autenticación-y-seguridad)

## Descripción general

El servicio expone recursos escolares bajo el prefijo `/api` y aplica:

- Persistencia relacional mediante Sequelize sobre PostgreSQL.
- Autenticación con JWT de acceso de corta duración.
- Refresh tokens opacos en cookie `HttpOnly`, con rotación y revocación.
- Autorización RBAC para `admin`, `docente` y `tutor`.
- Aislamiento a nivel de objeto para alumnos, grupos, calificaciones y
  notificaciones.
- Correo transaccional mediante Resend para activación y recuperación de
  cuentas.
- Cabeceras HTTP de seguridad con Helmet y CORS con allow-list.

Un alumno es una entidad académica del sistema; no existe un rol de inicio de
sesión `alumno` en el código actual.

## Stack tecnológico real

Las versiones corresponden a las declaraciones de `package.json`:

| Área | Tecnología |
| --- | --- |
| Runtime | Node.js (versión compatible con las dependencias instaladas) |
| HTTP | Express `^5.1.0` |
| ORM | Sequelize `^6.37.7` |
| Base de datos | PostgreSQL mediante `pg ^8.16.3` y `pg-hstore ^2.3.4` |
| Autenticación | `jsonwebtoken ^9.0.2` |
| Contraseñas | `bcryptjs ^3.0.3` |
| Correo | Resend `^6.22.1` |
| Seguridad HTTP | Helmet `^8.3.0` |
| CORS | `cors ^2.8.5` |
| Rate limiting | `express-rate-limit ^8.6.2` |
| Cookies | `cookie-parser ^1.4.7` |
| Configuración | `dotenv ^17.2.3` |
| Desarrollo | `nodemon ^3.1.11`, `sequelize-cli ^6.6.3` |

`nodemailer` aparece en las dependencias heredadas, pero el servicio de correo
implementado en `src/config/mailer.js` utiliza **Resend** y
`RESEND_API_KEY`; no utiliza SMTP ni las variables `MAIL_*`.

## Arquitectura del proyecto

```text
.
├── crearAdmin.js
├── package.json
├── src/
│   ├── config/
│   │   ├── config.js       # Conexión Sequelize por entorno
│   │   └── mailer.js       # Plantillas y envío mediante Resend
│   ├── controllers/        # Lógica de negocio y autorización de recursos
│   ├── middleware/
│   │   └── authJwt.js      # JWT y middlewares RBAC
│   ├── models/             # Modelos y asociaciones Sequelize
│   ├── routes/             # Montaje de endpoints REST
│   └── server.js           # Bootstrap, seguridad y escucha HTTP
└── .env.example
```

El arranque carga los modelos dinámicamente, ejecuta `db.sequelize.sync()` y
después comienza a escuchar en `0.0.0.0`. No se usa `alter: true` ni hay una
carpeta de migraciones en el repositorio; los cambios de esquema de producción
deben aplicarse con migraciones SQL/Sequelize controladas antes del despliegue.

## Arquitectura de autenticación y seguridad

### Access token

`POST /api/auth/login` devuelve un JWT en las propiedades `accessToken` y
`token` de la respuesta. El token:

- Se firma con `SECRET_KEY`.
- Usa el algoritmo `HS256`.
- Expira en 15 minutos.
- Contiene `id_usuario`, `rol`, `id_perfil` y `token_use: "access"`.

Los endpoints protegidos aceptan el token en `x-access-token` o en
`Authorization: Bearer <token>`. `verifyToken` valida firma, algoritmo,
expiración y `token_use`.

### Refresh token y RTR

El login genera un refresh token opaco aleatorio y lo envía en la cookie
`refreshToken`:

- `HttpOnly: true`.
- En producción: `Secure: true` y `SameSite: none`.
- En desarrollo: `SameSite: lax`.
- `Path: /api/auth`.
- Duración: 7 días.

El valor original no se guarda en la base de datos. Se almacena su hash
SHA-256 en `tb_sesiones`. `POST /api/auth/refresh` busca la sesión por hash,
comprueba expiración y revocación, revoca el token usado y emite uno nuevo.
Si detecta reutilización de un token revocado, revoca las sesiones del usuario
y exige iniciar sesión de nuevo.

`REFRESH_SECRET_KEY` se exige al arrancar el servidor por configuración de
seguridad, aunque el refresh token actual es opaco y aleatorio y no se firma
con ese secreto.

### RBAC y aislamiento BOLA/IDOR

Los middlewares disponibles son:

- `isAdmin`: solo `admin`.
- `isDocenteOrAdmin`: `docente` o `admin`.
- `isTutorOrAdmin`: `tutor` o `admin`.

Además de los middlewares de ruta, los controladores validan la propiedad del
recurso:

- Un docente solo lista y consulta alumnos de sus grupos.
- Un tutor solo lista y consulta sus propios alumnos.
- Un tutor solo consulta su propio perfil.
- Solo un docente asignado al grupo puede calificar a un alumno.
- Un docente solo crea notificaciones para alumnos de sus grupos.
- Un docente solo elimina sus propias notificaciones.
- Un administrador mantiene acceso global en las operaciones previstas.

### Activación y recuperación de cuentas

Los usuarios docente y tutor se crean inactivos con un token de activación
aleatorio y una expiración de 24 horas en
`token_activacion_expires_at`. La activación exige token válido, cuenta
inactiva y fecha vigente; al completar el proceso se limpian el token y su
fecha de expiración.

La recuperación de contraseña usa `resetPasswordToken` y
`resetPasswordExpires` con una vigencia de una hora. Los enlaces se construyen
con `CLIENT_URL` y se envían mediante Resend. Los tokens y URLs no se imprimen
en los logs de éxito.

### Controles perimetrales

- `helmet()` se aplica globalmente.
- CORS usa `credentials: true` y permite exactamente:
  `https://sigejod.com`, `https://www.sigejod.com`,
  `http://localhost:5173`, `http://127.0.0.1:5173`,
  `https://sigejob-client.vercel.app` y el valor de `CLIENT_URL`.
- Login: máximo 10 solicitudes por IP cada 15 minutos.
- Activación y reset: máximo 15 solicitudes por IP cada 15 minutos.
- Recuperación de contraseña: máximo 5 solicitudes por IP cada hora.
- `express.json()` y `express.urlencoded()` utilizan sus límites
  predeterminados porque no se configuró `limit` explícito.

## Diccionario de datos y modelo entidad-relación

Todos los modelos usan `timestamps: false`, salvo `tb_sesiones`, que conserva
`createdAt` y `updatedAt`.

### `tb_usuarios`

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `id_usuario` | INTEGER | PK, autoincremental |
| `nombre_completo` | STRING | Nullable |
| `email` | STRING | Obligatorio, único |
| `password` | STRING | Obligatorio, hash bcrypt |
| `rol` | STRING | Obligatorio: `admin`, `docente`, `tutor` |
| `token_activacion` | STRING | Nullable |
| `token_activacion_expires_at` | DATE | Nullable, expiración de 24 horas |
| `cuenta_activa` | BOOLEAN | Default `false` |
| `resetPasswordToken` | STRING | Nullable |
| `resetPasswordExpires` | DATE | Nullable |

Relación `hasMany` con `tb_sesiones`.

### `tb_sesiones`

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `id_sesion` | INTEGER | PK, autoincremental |
| `id_usuario` | INTEGER | Obligatorio, referencia a `tb_usuarios` |
| `token_hash` | STRING(64) | Obligatorio, SHA-256 |
| `revocado` | BOOLEAN | Obligatorio, default `false` |
| `expira_en` | DATE | Obligatorio |
| `ip_address` | STRING | Nullable |
| `user_agent` | STRING | Nullable |
| `createdAt`, `updatedAt` | DATE | Timestamps Sequelize |

Cada sesión `belongsTo` un usuario.

### `tb_docentes`

`id_docente` (INTEGER, PK autoincremental), `nombre` (STRING obligatorio),
`apellidos` (STRING obligatorio) y `email` (STRING obligatorio, único).

Un docente puede tener el grupo titular definido por la asociación
`hasOne(tb_grupos)` y muchas notificaciones.

### `tb_tutores`

`id_tutor` (INTEGER, PK autoincremental), `nombre` (STRING obligatorio),
`apellidos` (STRING obligatorio), `email` (STRING obligatorio, único) y
`telefono` (STRING nullable).

Un tutor tiene muchos alumnos.

### `tb_grupos`

`id_grupo` (INTEGER, PK autoincremental), `id_docente` (INTEGER obligatorio),
`grado` (STRING obligatorio) y `grupo` (STRING obligatorio).

Cada grupo pertenece a un docente y tiene muchos alumnos.

### `tb_alumnos`

`id_alumno` (INTEGER, PK autoincremental), `nombre` y `apellidos` (STRING
obligatorios), `id_grupo` e `id_tutor` (INTEGER obligatorios).

Cada alumno pertenece a un grupo y a un tutor, tiene muchas notificaciones y
participa en una relación N:M con materias mediante `tb_alumno_materia`.

### `tb_materias`

`id_materia` (INTEGER, PK autoincremental) y `nombre_materia` (STRING
obligatorio).

Se relaciona N:M con alumnos mediante `tb_alumno_materia`.

### `tb_alumno_materia`

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `id_alumno` | INTEGER | PK compuesta, obligatorio |
| `id_materia` | INTEGER | PK compuesta, obligatorio |
| `calificacion` | DECIMAL(5,2) | Nullable |

Cada fila pertenece a un alumno y a una materia.

### `tb_notificaciones`

`id_notificacion` (INTEGER, PK autoincremental), `id_docente` e `id_alumno`
(INTEGER obligatorios), `mensaje` (TEXT obligatorio), `fecha_envio` (DATEONLY
obligatorio) y `hora_envio` (TIME obligatorio).

Cada notificación pertenece a un docente y a un alumno. Las asociaciones usan
eliminación en cascada.

## Variables de entorno

El archivo `.env.example` contiene una plantilla histórica con variables
`MAIL_*`, pero esas variables no son leídas por el código actual. Para una
instalación funcional deben configurarse las variables que realmente consume
el backend:

| Variable | Obligatoria | Uso | Ejemplo seguro |
| --- | --- | --- | --- |
| `NODE_ENV` | No | Selecciona `development`, `test` o `production` | `development` |
| `PORT` | No | Puerto HTTP; default `3000` | `3000` |
| `DB_USER` | En local/test | Usuario PostgreSQL | `sigejod_app` |
| `DB_PASSWORD` | En local/test | Contraseña PostgreSQL | `cambia-esta-clave` |
| `DB_NAME` | En local/test | Base de datos PostgreSQL | `sigejod` |
| `DB_HOST` | En local/test | Host PostgreSQL | `localhost` |
| `DB_PORT` | En local/test | Puerto PostgreSQL | `5432` |
| `DATABASE_URL` | En producción | URL PostgreSQL de Render | `postgres://usuario:clave@host:5432/sigejod` |
| `SECRET_KEY` | Sí | Firma de access JWT; mínimo 32 caracteres | `genera-un-secreto-aleatorio-de-32-o-mas` |
| `REFRESH_SECRET_KEY` | Sí | Validación de configuración al arranque | `genera-otro-secreto-aleatorio-de-32-o-mas` |
| `RESEND_API_KEY` | Sí para correo | API de Resend | `re_xxxxxxxxxxxxxxxxx` |
| `CLIENT_URL` | Recomendada | URL del frontend y enlaces de correo; también entra al allow-list CORS | `http://localhost:5173` |
| `ADMIN_EMAIL` | No | Correo opcional para `crearAdmin.js` | `admin@sigejod.com` |
| `ADMIN_PASSWORD` | No | Contraseña opcional para `crearAdmin.js`; también puede pasarse como argumento | `usar-un-secreto-local` |

Genera secretos reales con un generador criptográficamente seguro. Nunca
subas `.env` ni credenciales a Git. El servidor termina el proceso si
`SECRET_KEY` o `REFRESH_SECRET_KEY` no existen o tienen menos de 32 caracteres.

## Catálogo exhaustivo de endpoints

### Ruta de salud

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/` | Público | Devuelve el mensaje de bienvenida de la API. |

### Autenticación y cuentas — `/api/auth`

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/auth/activar-cuenta` | Público; rate limit | Activa una cuenta con token y establece la contraseña inicial. |
| POST | `/api/auth/login` | Público; rate limit | Valida credenciales, genera access token y cookie refresh. |
| POST | `/api/auth/refresh` | Cookie refresh | Rota el refresh token y devuelve un nuevo access token. |
| POST | `/api/auth/logout` | Cookie refresh | Revoca la sesión asociada y limpia la cookie. |
| POST | `/api/auth/forgot-password` | Público; rate limit | Genera token de recuperación y envía correo mediante Resend. |
| POST | `/api/auth/reset-password` | Público; rate limit | Cambia la contraseña usando un token vigente. |

### Docentes — `/api/docentes`

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/docentes` | `admin` | Crea docente y envía correo de activación. |
| GET | `/api/docentes` | Cualquier usuario autenticado | Lista docentes con su grupo asociado. |
| GET | `/api/docentes/:id` | Cualquier usuario autenticado | Consulta un docente por ID. |
| PUT | `/api/docentes/:id` | `admin` | Actualiza datos del docente. |
| DELETE | `/api/docentes/:id` | `admin` | Elimina docente y su usuario asociado. |

### Tutores — `/api/tutores`

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/tutores` | `admin` | Crea tutor y envía correo de activación. |
| GET | `/api/tutores` | `admin` | Lista todos los tutores. |
| GET | `/api/tutores/:id` | Autenticado; tutor solo su propio perfil | Consulta tutor con alumnos asociados. |
| PUT | `/api/tutores/:id` | `admin` | Actualiza datos del tutor. |
| DELETE | `/api/tutores/:id` | `admin` | Elimina tutor y su usuario asociado. |

### Alumnos — `/api/alumnos`

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/alumnos` | `admin` | Crea alumno asociado a grupo y tutor. |
| GET | `/api/alumnos` | Autenticado; alcance por rol | Admin ve todos; docente ve sus grupos; tutor ve sus alumnos. |
| GET | `/api/alumnos/:id` | Autenticado; alcance por recurso | Consulta alumno si el tutor o docente tiene relación autorizada. |
| PUT | `/api/alumnos/:id` | `admin` | Actualiza datos del alumno. |
| DELETE | `/api/alumnos/:id` | `admin` | Elimina alumno. |

### Grupos — `/api/grupos`

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/grupos` | `admin` | Crea grupo y asigna docente titular. |
| GET | `/api/grupos` | Cualquier usuario autenticado | Lista grupos con docente. |
| GET | `/api/grupos/:id` | Cualquier usuario autenticado | Consulta grupo por ID. |
| PUT | `/api/grupos/:id` | `admin` | Actualiza grupo y asignación docente. |
| DELETE | `/api/grupos/:id` | `admin` | Elimina grupo. |

### Materias — `/api/materias`

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/materias` | `docente` o `admin` | Crea una materia. |
| GET | `/api/materias` | Cualquier usuario autenticado | Lista materias. |
| GET | `/api/materias/:id` | Cualquier usuario autenticado | Consulta materia con alumnos inscritos. |
| PUT | `/api/materias/:id` | `docente` o `admin` | Actualiza materia. |
| DELETE | `/api/materias/:id` | `admin` | Elimina materia. |

### Alumno-Materia y calificaciones — `/api/alumnomateria`

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/alumnomateria` | `admin` | Inscribe alumno en una materia. |
| DELETE | `/api/alumnomateria/:id_alumno/:id_materia` | `admin` | Da de baja la inscripción. |
| PUT | `/api/alumnomateria/:id_alumno/:id_materia` | `docente` o `admin`; docente debe tener el grupo | Crea o actualiza la calificación. |
| GET | `/api/alumnomateria/alumno/:id_alumno` | Cualquier usuario autenticado | Consulta materias y calificaciones del alumno. |
| GET | `/api/alumnomateria/materia/:id_materia` | `docente` o `admin` | Lista alumnos inscritos; el docente ve su grupo. |

### Notificaciones — `/api/notificaciones`

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/notificaciones` | `docente` o `admin`; docente debe tener el grupo | Crea aviso para un alumno. |
| GET | `/api/notificaciones` | `admin`, `docente` o `tutor` | Admin ve todas; docente sus avisos; tutor los de sus alumnos. |
| GET | `/api/notificaciones/alumno/:id` | Autenticado; alcance por alumno | Consulta avisos de un alumno autorizado. |
| DELETE | `/api/notificaciones/:id` | `admin` o docente propietario | Elimina notificación. |

Todas las rutas protegidas usan `verifyToken`. Los middlewares de rol se
indican en la tabla; varias reglas de propiedad se aplican adicionalmente
desde los controladores.

## Instalación local

### Requisitos

- Node.js instalado.
- PostgreSQL disponible localmente o una URL PostgreSQL accesible.
- Una cuenta de Resend y una API key si se probarán correos.

### Pasos

```bash
git clone https://github.com/IvanOs20/Alerta-Temprana.git
cd Alerta-Temprana
npm install
```

Copia `.env.example` a `.env` y completa las variables reales descritas en
[Variables de entorno](#variables-de-entorno). En desarrollo se usan
`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST` y `DB_PORT`; en producción se
usa `DATABASE_URL`.

Para crear o sincronizar el administrador:

```bash
node crearAdmin.js "admin@sigejod.com" "Usa-una-clave-local-segura"
```

También puede utilizarse `ADMIN_EMAIL` y `ADMIN_PASSWORD`. El script cierra la
conexión Sequelize al terminar.

### Scripts

```bash
npm run dev   # nodemon src/server.js
npm start     # node src/server.js
npm test      # actualmente termina con "Error: no test specified"
```

Al arrancar, Sequelize ejecuta `sync()` sin sincronización forzada. En una
base existente, aplica manualmente cambios de esquema como
`token_activacion_expires_at` antes de iniciar una versión que los requiera.

## Despliegue en producción

### Render y PostgreSQL

1. Crear el Web Service y PostgreSQL en Render.
2. Configurar `NODE_ENV=production`.
3. Configurar `DATABASE_URL` con la URL proporcionada por Render.
4. Configurar `SECRET_KEY`, `REFRESH_SECRET_KEY` y `RESEND_API_KEY`.
5. Configurar `CLIENT_URL` con el origen exacto del frontend.
6. Ejecutar `npm install` durante el build y `npm start` como comando de inicio.
7. Aplicar cualquier cambio de esquema antes de arrancar el servicio.

La configuración de producción solicita SSL para PostgreSQL con
`rejectUnauthorized: false` tal como está definido actualmente en
`src/config/config.js`. Debe revisarse la política de certificados del
proveedor antes de un despliegue con requisitos estrictos de validación TLS.

### Vercel y CORS

El origen del frontend debe coincidir exactamente con uno de los valores
permitidos por `src/server.js`. Para una aplicación desplegada en Vercel,
configura `CLIENT_URL` con su URL HTTPS final y verifica que no existan
redirecciones que cambien el origen. Las solicitudes que usen la cookie de
refresh deben habilitar credenciales en el cliente:

```js
fetch(`${API_URL}/api/auth/refresh`, {
  method: 'POST',
  credentials: 'include'
});
```

No compartas `SECRET_KEY`, `REFRESH_SECRET_KEY`, `DATABASE_URL` ni
`RESEND_API_KEY` con el frontend.

## Licencia y estado del proyecto

El `package.json` declara licencia `ISC`. El repositorio no define actualmente
un conjunto de pruebas automatizadas ejecutable: `npm test` conserva el script
placeholder de npm.
