const db = require('../models');
const Usuario = db.tb_usuarios;
const Docente = db.tb_docentes;
const Tutor = db.tb_tutores;
const Alumno = db.tb_alumnos; 
const crypto = require("crypto"); 
const { Op } = require("sequelize"); 
const mailer = require("../config/mailer.js");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// En producción, usa variables de entorno (.env)
const SECRET_KEY = process.env.SECRET_KEY || 'secreto_super_seguro';

// -------------------------------------------------------------------------
// 1. ACTIVAR CUENTA (El link del correo llega aquí)
// -------------------------------------------------------------------------
exports.activarCuenta = async (req, res) => {
  try {
    const { token, nuevaPassword } = req.body;

    // A. Buscar al usuario que tenga ese token pendiente
    const usuario = await Usuario.findOne({ 
      where: { token_activacion: token } 
    });

    if (!usuario) {
      return res.status(400).send({ 
        message: "Token inválido o expirado. Es posible que la cuenta ya esté activa." 
      });
    }

    // B. Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    // C. Actualizar el usuario
    await Usuario.update(
      { 
        password: hashedPassword,
        cuenta_activa: true,
        token_activacion: null 
      },
      { where: { id_usuario: usuario.id_usuario } }
    );

    res.send({ message: "¡Cuenta activada con éxito! Ahora puede iniciar sesión." });

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// -------------------------------------------------------------------------
// 2. LOGIN INTELIGENTE (Detecta hijos del tutor)
// -------------------------------------------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // A. Buscar en tabla de Usuarios
    const usuario = await Usuario.findOne({ where: { email: email } });
    
    if (!usuario) {
      return res.status(404).send({ message: "Usuario no encontrado." });
    }

    // B. Verificar si la cuenta está activa
    if (!usuario.cuenta_activa) {
      return res.status(403).send({ 
        message: "Esta cuenta aún no ha sido activada. Revise su correo electrónico." 
      });
    }

    // C. Verificar contraseña
    const passwordIsValid = await bcrypt.compare(password, usuario.password);
    if (!passwordIsValid) {
      return res.status(401).send({ accessToken: null, message: "Contraseña incorrecta." });
    }

    // D. BUSCAR DATOS DE PERFIL
    let idPerfil = null; 
    let hijosEncontrados = null; 

    if (usuario.rol === 'docente') {
      const docente = await Docente.findOne({ where: { email: email } });
      if (docente) idPerfil = docente.id_docente;
    } 
    else if (usuario.rol === 'tutor') {
      const tutor = await Tutor.findOne({ where: { email: email } });
      
      if (tutor) {
        idPerfil = tutor.id_tutor;
        // Buscar hijos
        hijosEncontrados = await Alumno.findAll({
          where: { id_tutor: idPerfil },
          attributes: ['id_alumno', 'nombre', 'apellidos'] 
        });
      }
    }

    // E. Generar Token
    const token = jwt.sign(
      { 
        id_usuario: usuario.id_usuario, 
        rol: usuario.rol, 
        id_perfil: idPerfil 
      }, 
      SECRET_KEY, 
      { expiresIn: 86400 } // 24 horas
    );

    // F. CONSTRUIR RESPUESTA
    const dataResponse = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre_completo,
      email: usuario.email,
      rol: usuario.rol,
      id_perfil: idPerfil,
      accessToken: token
    };

    if (hijosEncontrados !== null) {
      dataResponse.hijos = hijosEncontrados;
    }

    res.status(200).send(dataResponse);

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// -------------------------------------------------------------------------
// 3. SOLICITAR CAMBIO (Forgot Password - OPTIMIZADO ASÍNCRONO)
// -------------------------------------------------------------------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Usuario.findOne({ where: { email: email } }); 

    if (!user) {
      return res.status(404).send({ message: "Usuario no encontrado." });
    }

    // Generar token
    const token = crypto.randomBytes(20).toString('hex');

    // Guardar en BD
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    // A. Responder inmediatamente al cliente (< 50ms)
    res.send({ message: "Correo enviado. Revisa tu bandeja." });

    // B. Despachar el correo en segundo plano sin bloquear la respuesta
    mailer.enviarCorreoRecuperacion(
      user.email, 
      user.nombre_completo || "Usuario", 
      token
    ).catch((mailErr) => {
      console.error("⚠️ Error al enviar correo de recuperación en segundo plano:", mailErr);
    });

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// -------------------------------------------------------------------------
// 4. GUARDAR NUEVA CONTRASEÑA (Reset Password)
// -------------------------------------------------------------------------
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Buscar usuario con token válido y fecha vigente
    const user = await Usuario.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).send({ message: "Token inválido o expirado." });
    }

    // Encriptar y guardar
    user.password = bcrypt.hashSync(newPassword, 8); 
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    await user.save();

    res.send({ message: "Contraseña actualizada con éxito." });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};