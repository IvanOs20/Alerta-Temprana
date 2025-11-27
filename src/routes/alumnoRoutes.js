const express = require('express');
const router = express.Router();
const alumnos = require('../controllers/alumnoController'); // Importamos el controller

// Crear un nuevo alumno
router.post('/', alumnos.create);

// Obtener todos los alumnos
router.get('/', alumnos.findAll);

// Obtener un solo alumno por id
router.get('/:id', alumnos.findOne);

// Actualizar un alumno por id
router.put('/:id', alumnos.update);

// Eliminar un alumno por id
router.delete('/:id', alumnos.delete);

module.exports = router;