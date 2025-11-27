require('dotenv').config(); // Carga las variables de entorno (base de datos)
const express = require('express'); 
const app = express();

// Middleware para que el servidor entienda JSON (importante para los POST/PUT)
app.use(express.json()); 
// Middleware para entender datos de formularios simples
app.use(express.urlencoded({ extended: true }));

// --- IMPORTAR RUTAS ---
const alumnoRoutes = require('./routes/alumnoRoutes');
const docenteRoutes = require('./routes/docenteRoutes');
const grupoRoutes = require('./routes/grupoRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const alumnoMateriaRoutes = require('./routes/alumnoMateriaRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');

// --- USAR RUTAS ---
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/docentes', docenteRoutes);
app.use('/api/grupos', grupoRoutes);
app.use('/api/tutores', tutorRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/alumnomateria', alumnoMateriaRoutes);
app.use('/api/notificaciones', notificacionRoutes);

// Ruta de prueba simple para ver si el servidor responde
app.get('/', (req, res) => {
  res.json({ message: "Bienvenido a la API del Sistema Escolar." });
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});