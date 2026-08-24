const express = require('express');
const router = express.Router();
const notificaciones = require('../controllers/notificacionController');
const authJwt = require('../middleware/authJwt'); // Importamos el middleware de autenticación

// Crear (Enviar mensaje) - Requiere sesión activa
router.post('/', [authJwt.verifyToken], notificaciones.create);

// Ver todas (Filtrado automático por Docente o Historial general para Admin)
router.get('/', [authJwt.verifyToken], notificaciones.findAll);

// Ver buzón de un alumno específico
router.get('/alumno/:id', [authJwt.verifyToken], notificaciones.findByAlumno);

// Borrar mensaje
router.delete('/:id', [authJwt.verifyToken], notificaciones.delete);

module.exports = router;