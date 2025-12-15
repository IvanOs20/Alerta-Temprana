const express = require('express');
const router = express.Router();
const materias = require('../controllers/materiaController');
const { verifyToken,  isAdmin, isDocenteOrAdmin } = require('../middleware/authJwt');

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
  next();
});


// SEGÚN TU FLUJO: Docente crea materias
// (Agregamos isAdmin también por si acaso el director necesita intervenir)
router.post('/', verifyToken, isDocenteOrAdmin, materias.create);
router.put('/:id', verifyToken, isDocenteOrAdmin, materias.update);


// Solo Admin borra (por seguridad) o si quieres que el docente borre, agrega isDocente
router.delete('/:id', [verifyToken, isAdmin], materias.delete);

// Tutor y Alumno ven las materias
router.get('/', [verifyToken], materias.findAll);
router.get('/:id', [verifyToken], materias.findOne);

module.exports = router;