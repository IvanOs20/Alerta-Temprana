const express = require('express');
const router = express.Router();
const tutores = require('../controllers/tutorController');
const { verifyToken, isAdmin } = require('../middleware/authJwt');

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
  next();
});

// Admin crea al tutor
router.post('/', [verifyToken, isAdmin], tutores.create);

// Admin gestiona
router.put('/:id', [verifyToken, isAdmin], tutores.update);
router.delete('/:id', [verifyToken, isAdmin], tutores.delete);

// Admin ve lista completa. Tutor ve su propio perfil (por ID)
router.get('/', [verifyToken, isAdmin], tutores.findAll);
router.get('/:id', [verifyToken], tutores.findOne);

module.exports = router;
