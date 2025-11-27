const express = require('express');
const router = express.Router();
const notificaciones = require('../controllers/notificacionController');

// Crear (Enviar mensaje)
router.post('/', notificaciones.create);

// Ver todas (Historial general)
router.get('/', notificaciones.findAll);

// Ver buzón de un alumno específico
router.get('/alumno/:id', notificaciones.findByAlumno);

// Borrar mensaje
router.delete('/:id', notificaciones.delete);

module.exports = router;