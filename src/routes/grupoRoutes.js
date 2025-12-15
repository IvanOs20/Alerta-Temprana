const express = require('express');
const router = express.Router();
const grupos = require('../controllers/grupoController');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
  next();
});

// Admin crea grupos
router.post('/', [verifyToken, isAdmin], grupos.create);

// Admin edita/borra
router.put('/:id', [verifyToken, isAdmin], grupos.update);
router.delete('/:id', [verifyToken, isAdmin], grupos.delete);

// Docente ve sus grupos (Acceso general con token)
router.get('/', [verifyToken], grupos.findAll);
router.get('/:id', [verifyToken], grupos.findOne);

module.exports = router;