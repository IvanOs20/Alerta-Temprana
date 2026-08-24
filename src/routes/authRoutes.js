const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

// -------------------------------------------------------------------------
// CONFIGURACIÓN DE LIMITADORES (RATE LIMITING)
// -------------------------------------------------------------------------

// 1. Limitador para Login: 10 intentos por IP cada 15 minutos (Previene fuerza bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Demasiados intentos de inicio de sesión. Por seguridad, espere 15 minutos."
  }
});

// 2. Limitador para Envío de Correos: Máximo 5 solicitudes por IP cada hora (Protege cuota de Gmail)
const mailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Ha superado el límite de solicitudes de correo. Intente nuevamente en 1 hora."
  }
});

// 3. Limitador para Activación y Cambio de Clave: 15 intentos por IP cada 15 minutos
const passLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Demasiadas peticiones. Intente más tarde."
  }
});

// -------------------------------------------------------------------------
// RUTAS DE AUTENTICACIÓN
// -------------------------------------------------------------------------

// 1. Ruta para activar cuenta (Token del correo)
router.post('/activar-cuenta', passLimiter, authController.activarCuenta);

// 2. Ruta para iniciar sesión (Protegida contra fuerza bruta)
router.post('/login', loginLimiter, authController.login);

// 3. Rutas de Recuperación de Contraseña
router.post('/forgot-password', mailLimiter, authController.forgotPassword);
router.post('/reset-password', passLimiter, authController.resetPassword);

module.exports = router