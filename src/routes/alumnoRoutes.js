const express = require('express');
const router = express.Router();
const alumnos = require('../controllers/alumnoController'); 
// 1. Importamos la seguridad
const { verifyToken, isAdmin } = require('../middleware/authJwt');

// 2. Middleware para cabeceras
router.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// ------------------------------------------------------------------
// ZONA ADMIN (Gestión de Alumnos)
// ------------------------------------------------------------------

// Crear un nuevo alumno (Solo Admin)
router.post('/', [verifyToken, isAdmin], alumnos.create);

// Actualizar datos del alumno (Solo Admin puede cambiar nombres o grupos)
router.put('/:id', [verifyToken, isAdmin], alumnos.update);

// Eliminar un alumno (Solo Admin puede dar de baja)
router.delete('/:id', [verifyToken, isAdmin], alumnos.delete);


// ------------------------------------------------------------------
// 🔓 ZONA DE CONSULTA (Docentes y Tutores)
// ------------------------------------------------------------------

// Obtener todos los alumnos
// El Docente necesita esto para ver su lista de asistencia.
router.get('/', [verifyToken], alumnos.findAll);

// Obtener un solo alumno por id
// El Tutor usa esto para ver el perfil específico de su hijo.
router.get('/:id', [verifyToken], alumnos.findOne);

module.exports = router;