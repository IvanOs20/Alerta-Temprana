require('dotenv').config(); // Carga las variables de entorno
const express = require('express');
const cors = require('cors');
const app = express();


// 1. IMPORTAR LA BASE DE DATOS
const db = require('./models'); 

// Middleware para entender JSON y Formularios
app.use(cors());
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
const authRoutes = require('./routes/authRoutes'); // <--- Importado correctamente

// --- USAR RUTAS ---
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/docentes', docenteRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/tutores', tutorRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/alumnomateria', alumnoMateriaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/auth', authRoutes); // <--- ¡ACTIVO! Tus rutas de login estarán aquí

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: "Bienvenido a la API del Sistema Escolar." });
});

// --- INICIAR SERVIDOR Y BASE DE DATOS ---
const PORT = process.env.PORT || 3000;

// CAMBIO IMPORTANTE: Usamos { alter: true } 
// Esto actualiza las tablas si hay cambios, pero NO BORRA tus datos.
db.sequelize.sync({ alter: true }).then(() => {
    console.log("------------------------------------------------");
    console.log("Base de datos sincronizada (Modo: Alter).");
    console.log("------------------------------------------------");
    
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });
}).catch((err) => {
    console.error("Error al sincronizar la base de datos:", err);
});