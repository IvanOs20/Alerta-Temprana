require('dotenv').config(); // Carga las variables de entorno
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

// 1. IMPORTAR LA BASE DE DATOS
const db = require('./models');

// 2. APLICAR CABECERAS DE SEGURIDAD
app.use(helmet());

// 3. CONFIGURAR CORS CON TODAS LAS CABECERAS NECESARIAS
const origenesPermitidos = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  //'https://alerta-temprana-g0kp.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origenesPermitidos.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acceso bloqueado por política de CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'authorization',
    'x-access-token',
    'Origin',
    'Accept',
    'X-Requested-With'
  ]
}));

// Middlewares para JSON y Formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- IMPORTAR RUTAS ---
const alumnoRoutes = require('./routes/alumnoRoutes');
const docenteRoutes = require('./routes/docenteRoutes');
const grupoRoutes = require('./routes/grupoRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const alumnoMateriaRoutes = require('./routes/alumnoMateriaRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const authRoutes = require('./routes/authRoutes');

// --- USAR RUTAS ---
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/docentes', docenteRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/tutores', tutorRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/alumnomateria', alumnoMateriaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: "Bienvenido a la API del Sistema Escolar." });
});

// --- INICIAR SERVIDOR Y BASE DE DATOS ---
const PORT = process.env.PORT || 3000;

db.sequelize.sync().then(() => {
    console.log("------------------------------------------------");
    console.log("Base de datos conectada (Sin sincronización forzada).");
    console.log("------------------------------------------------");
    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en puerto ${PORT} en 0.0.0.0`);
    });
}).catch((err) => {
    console.error("Error al conectar la base de datos:", err);
});