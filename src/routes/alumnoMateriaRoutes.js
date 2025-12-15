const express = require('express');
const router = express.Router();
const controller = require('../controllers/alumnoMateriaController'); // Verifica el nombre del archivo
const { verifyToken, isAdmin, isDocenteOrAdmin } = require('../middleware/authJwt');

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
  next();
});

// Admin inscribe (asigna materia al alumno)
router.post('/', [verifyToken, isAdmin], controller.inscribir);

// Admin da de baja
router.delete('/:id_alumno/:id_materia', [verifyToken, isAdmin], controller.darBaja);

//DOCENTE (y Admin) califica
router.put('/:id_alumno/:id_materia',[verifyToken,isDocenteOrAdmin],controller.calificar);

//BOLETA: TODOS los usuarios autenticados pueden verla
router.get('/alumno/:id_alumno', [verifyToken], controller.verMateriasDeAlumno);
//LISTA DE ALUMNOS EN MATERIA: SOLO ADMIN Y DOCENTE
router.get('/materia/:id_materia',[verifyToken,isDocenteOrAdmin],controller.verAlumnosEnMateria);

module.exports = router;