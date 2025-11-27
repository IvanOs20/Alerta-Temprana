const express = require('express');
const router = express.Router();

// Importamos el controlador que acabamos de hacer
const controller = require('../controllers/alumnoMateriaController');

// --- Definición de Rutas ---

// 1. Inscribir (POST /api/alumnomateria)
router.post('/', controller.inscribir);

// 2. Ver materias de un alumno (GET /api/alumnomateria/alumno/:id_alumno)
router.get('/alumno/:id_alumno', controller.verMateriasDeAlumno);

// 3. Ver alumnos de una materia (GET /api/alumnomateria/materia/:id_materia)
router.get('/materia/:id_materia', controller.verAlumnosEnMateria);

// 4. Calificar (PUT /api/alumnomateria/:id_alumno/:id_materia)
// OJO: Necesita los dos IDs en la URL para saber a quién calificar en qué materia
router.put('/:id_alumno/:id_materia', controller.calificar);

// 5. Dar de baja (DELETE /api/alumnomateria/:id_alumno/:id_materia)
router.delete('/:id_alumno/:id_materia', controller.darBaja);

module.exports = router;