const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. Ruta para activar cuenta (ESTA ES LA QUE TE FALTA O TIENE ERROR)
router.post('/activar-cuenta', authController.activarCuenta);

// 2. Ruta para iniciar sesión
router.post('/login', authController.login);

module.exports = router;