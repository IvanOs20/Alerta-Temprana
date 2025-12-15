const express = require('express');
const router = express.Router();
const docentes = require('../controllers/docenteController');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
  next();
});

// Admin crea al docente
router.post('/', [verifyToken, isAdmin], docentes.create);

// Admin gestiona (editar/borrar)
router.put('/:id', [verifyToken, isAdmin], docentes.update);
router.delete('/:id', [verifyToken, isAdmin], docentes.delete);

// Todos pueden ver la lista (necesario para selects en el front) o perfil
router.get('/', [verifyToken], docentes.findAll);
router.get('/:id', [verifyToken], docentes.findOne);

module.exports = router;