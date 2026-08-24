# 🏫 SigeJOD API - Sistema de Comunicación y Gestión Escolar (v2)

API RESTful empresarial y desacoplada desarrollada con **Node.js**, **Express**, **Sequelize ORM** y **PostgreSQL**[cite: 1, 2, 4]. Diseñada para centralizar la administración institucional, la captura y seguimiento de calificaciones, el control de incidencias conductuales y la comunicación bidireccional entre la administración, el cuerpo docente y los tutores legales[cite: 1, 2, 4].

---

## 🚀 Novedades y Optimizaciones Técnicas (Versión 2.0)

* **Pool de Conexiones Optimizado (PostgreSQL):** Gestión concurrente eficiente (`max: 10`, `min: 2`, `acquire: 30000ms`, `idle: 10000ms`) que previene la saturación de sockets y minimiza el uso de memoria RAM[cite: 1, 7].
* **Desacoplamiento Asíncrono de Correos (SMTP):** Procesamiento de correos electrónicos en segundo plano (*Background Event Loop*) con pool de sockets TLS persistentes en Nodemailer, reduciendo el tiempo de respuesta HTTP de 60s a <50ms[cite: 1, 7].
* **Control de Acceso Basado en Roles (RBAC):** Middlewares de inspección criptográfica (`verifyToken`, `isAdmin`, `isDocente`, `isTutor`, `isDocenteOrAdmin`) y aislamiento estricto de datos (*Multi-Tenancy*) por salón y familia[cite: 1, 6].
* **Blindaje Perimetral (OWASP):** 
  * Protección contra ataques de fuerza bruta y saturación mediante `express-rate-limit` en rutas críticas[cite: 1].
  * Cabeceras de seguridad HTTP con `helmet` (anti-clickjacking, prevención de sniffing MIME y ocultamiento de tecnología del servidor)[cite: 1, 5].
  * Restricción de orígenes cruzados vía `cors` con soporte para entornos locales y productivos[cite: 1, 5].
* **Consultas Relacionales Optimizadas (*JOINs*):** Respuestas enriquecidas con cruce automático de modelos (ej. inclusión directa del grupo titular en consultas de docentes)[cite: 1].
* **Sincronización Declarativa de Esquema:** Migraciones no destructivas mediante `sequelize.sync({ alter: true })`.

---

## 🛠️ Stack Tecnológico

* **Entorno de Ejecución:** [Node.js](https://nodejs.org/) (v18+)[cite: 4]
* **Framework Web:** [Express.js](https://expressjs.com/)[cite: 2, 4]
* **Base de Datos Relacional:** [PostgreSQL](https://www.postgresql.org/)[cite: 2, 4]
* **Mapeador Objeto-Relacional (ORM):** [Sequelize](https://sequelize.org/)[cite: 2, 4]
* **Autenticación y Criptografía:** [JSON Web Tokens (JWT)](https://jwt.io/) & [Bcryptjs](https://www.npmjs.com/package/bcryptjs)[cite: 1, 2]
* **Seguridad Perimetral:** [Helmet](https://helmetjs.github.io/) & [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit)[cite: 1, 5]
* **Servicio de Notificaciones y Correo:** [Nodemailer](https://nodemailer.com/) (Pool SMTP / Gmail)[cite: 1, 2, 7]
* **Infraestructura Cloud:** [Render](https://render.com/) (Web Service + PostgreSQL)[cite: 2, 4]

---

## 🏛️ Estructura del Proyecto

```text
src/
├── config/             # Configuración de base de datos, pool y transporte SMTP
│   ├── config.js       # Variables de entorno y conexión por entorno (dev/prod)
│   └── mailer.js       # Pool de Nodemailer y plantillas de correo transaccional
├── controllers/        # Controladores de lógica de negocio
│   ├── alumnoController.js
│   ├── alumnoMateriaController.js
│   ├── authController.js
│   ├── docenteController.js
│   ├── grupoController.js
│   ├── materiaController.js
│   ├── notificacionController.js
│   └── tutorController.js
├── middleware/         # Filtros de interceptación y validación
│   └── authJwt.js      # Validación de JWT, Rate Limiting y reglas RBAC
├── models/             # Esquemas de Sequelize y asociaciones relacionales
│   ├── alumno.js
│   ├── alumno_materia.js
│   ├── docente.js
│   ├── grupo.js
│   ├── index.js        # Carga dinámica e inicialización de asociaciones
│   ├── materia.js
│   ├── notificacion.js
│   ├── tutor.js
│   └── usuario.js
├── routes/             # Definición y protección de endpoints REST
│   ├── alumnoMateriaRoutes.js
│   ├── alumnoRoutes.js
│   ├── authRoutes.js
│   ├── docenteRoutes.js
│   ├── grupoRoutes.js
│   ├── materiaRoutes.js
│   ├── notificacionRoutes.js
│   └── tutorRoutes.js
└── server.js           # Punto de entrada de la aplicación y montaje de middlewares



🔐 Variables de Entorno (.env)

Crea un archivo .env en la raíz del proyecto tomando como base la siguiente plantilla:

Fragmento de código
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos Local (PostgreSQL)
DB_USER=postgres
DB_PASSWORD=tu_password_local
DB_NAME=sigejod_db
DB_HOST=localhost
DB_PORT=5432

# Base de Datos en Producción (Render / Cloud)
DATABASE_URL=postgresql://usuario:pass@host:5432/bd_produccion

# Seguridad y Autenticación
JWT_SECRET=tu_clave_secreta_jwt_super_segura

# Cliente / Frontend (Para enlaces de activación y reseteo)
CLIENT_URL=http://localhost:5173

# Servicio de Correo SMTP (Gmail App Password)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=tu_contraseña_de_aplicacion_google


📋 Catálogo de Endpoints de la API

Autenticación y Cuentas (/api/auth)
POST /api/auth/login - Inicio de sesión unificado (valida credenciales, estado de cuenta y genera JWT).

POST /api/auth/activar-cuenta - Activación de primer acceso mediante token criptográfico.

POST /api/auth/forgot-password - Solicitud de restablecimiento de contraseña vía correo SMTP.

POST /api/auth/reset-password - Registro de nueva contraseña validando token de recuperación


📋 Gestión de Usuarios y Estructura Escolar (Requiere Rol Admin)
GET|POST /api/docentes - Catálogo y registro de personal docente (incluye asignación de salón).

PUT|DELETE /api/docentes/:id - Actualización de información y baja de docentes.

GET|POST /api/tutores - Padrón y registro de tutores legales.

PUT|DELETE /api/tutores/:id - Edición y eliminación de registros de tutores.

GET|POST /api/grupos - Consulta y creación de grupos escolares con asignación de titular.

GET|POST /api/materias - Catálogo institucional de asignaturas.


📋 Padrón Estudiantil y Calificaciones
GET /api/alumnos - Consulta de alumnos (retorna lista global a Admin, grupo asignado a Docente o hijos vinculados a Tutor).

POST /api/alumnos - Alta de alumnos asociando grupo y tutor legal.

POST /api/alumnomateria - Inscripción de asignaturas a boletas escolares.

GET /api/alumnomateria/materia/:id_materia - Lista de calificaciones por materia filtrada por el grupo del docente.

GET /api/alumnomateria/alumno/:id_alumno - Boleta digital completa de un alumno específico.

PUT /api/alumnomateria/:id_alumno/:id_materia - Captura y actualización de calificaciones.


📋 Centro de Avisos e Incidencias (/api/notificaciones)
POST /api/notificaciones - Emisión de reportes conductuales o avisos académicos de un docente hacia un estudiante.

GET /api/notificaciones - Bandeja de reportes emitidos por el docente autenticado.

GET /api/notificaciones/alumno/:id - Bandeja de avisos e incidencias recibidas para el expediente del alumno[cite: 1, 4].


⚙️ Puesta en Marcha Local

1. Clonar el repositorio y cambiar a la rama v2
Bash
git clone [https://github.com/IvanOs20/Alerta-Temprana.git](https://github.com/IvanOs20/Alerta-Temprana.git)
cd Alerta-Temprana
git checkout v2

2. Instalar dependencias
npm install

3. Ejecutar en entorno de desarrollo
npm run dev

4. Ejecutar en entorno de producción
npm start