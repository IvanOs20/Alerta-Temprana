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

const Sesion = db.tb_sesiones;
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const crearAccessToken = (usuario, idPerfil) => jwt.sign(
  {
    id_usuario: usuario.id_usuario,
    rol: usuario.rol,
    id_perfil: idPerfil,
    token_use: 'access'
  },
  process.env.SECRET_KEY,
  { algorithm: 'HS256', expiresIn: '15m' }
);

const crearRefreshToken = () => crypto.randomBytes(40).toString('hex');

const hashRefreshToken = (refreshToken) => crypto
  .createHash('sha256')
  .update(refreshToken)
  .digest('hex');

const guardarSesion = async (usuarioId, refreshToken, req) => {
  const expiraEn = new Date(Date.now() + cookieOptions.maxAge);

  return Sesion.create({
    id_usuario: usuarioId,
    token_hash: hashRefreshToken(refreshToken),
    expira_en: expiraEn,
    ip_address: req.ip,
    user_agent: req.get('user-agent') || null
  });
};

const emitirRefreshToken = async (usuarioId, req, res) => {
  const refreshToken = crearRefreshToken();
  await guardarSesion(usuarioId, refreshToken, req);
  res.cookie('refreshToken', refreshToken, cookieOptions);
  return refreshToken;
};

// -------------------------------------------------------------------------
// 1. ACTIVAR CUENTA (El link del correo llega aquí)
// -------------------------------------------------------------------------
exports.activarCuenta = async (req, res) => {
  try {
    const { token, nuevaPassword } = req.body;

    // A. Buscar al usuario que tenga ese token pendiente
    const usuario = await Usuario.findOne({ 
      where: {
        token_activacion: token,
        cuenta_activa: false,
        token_activacion_expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!usuario) {
      const tokenExpirado = await Usuario.findOne({
        where: {
          token_activacion: token,
          cuenta_activa: false
        }
      });

      if (
        tokenExpirado &&
        tokenExpirado.token_activacion_expires_at &&
        tokenExpirado.token_activacion_expires_at <= new Date()
      ) {
        return res.status(400).send({
          message: "El enlace de activación ha expirado. Solicite uno nuevo."
        });
      }

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
        token_activacion: null,
        token_activacion_expires_at: null
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
    const accessToken = crearAccessToken(usuario, idPerfil);
    await emitirRefreshToken(usuario.id_usuario, req, res);

    // F. CONSTRUIR RESPUESTA
    const dataResponse = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre_completo,
      email: usuario.email,
      rol: usuario.rol,
      id_perfil: idPerfil,
      accessToken,
      token: accessToken
    };

    if (hijosEncontrados !== null) {
      dataResponse.hijos = hijosEncontrados;
    }

    res.status(200).send(dataResponse);

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.refresh = async (req, res) => {
  const refreshToken = req.cookies && req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).send({ message: "Refresh token no proporcionado" });
  }

  try {
    const tokenHash = hashRefreshToken(refreshToken);
    const sesion = await Sesion.findOne({ where: { token_hash: tokenHash } });

    if (!sesion || sesion.expira_en < new Date()) {
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(401).send({ message: "Sesión inválida o expirada" });
    }

    if (sesion.revocado) {
      await Sesion.update(
        { revocado: true },
        { where: { id_usuario: sesion.id_usuario } }
      );
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(403).send({
        message: "Alerta de seguridad: Sesión comprometida. Inicie sesión nuevamente"
      });
    }

    const [sesionRevocada] = await Sesion.update(
      { revocado: true },
      { where: { id_sesion: sesion.id_sesion, revocado: false } }
    );

    if (sesionRevocada !== 1) {
      await Sesion.update(
        { revocado: true },
        { where: { id_usuario: sesion.id_usuario } }
      );
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(403).send({
        message: "Alerta de seguridad: Sesión comprometida. Inicie sesión nuevamente"
      });
    }

    const usuario = await Usuario.findByPk(sesion.id_usuario);
    if (!usuario || !usuario.cuenta_activa) {
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(401).send({ message: "Sesión inválida o expirada" });
    }

    let idPerfil = null;
    if (usuario.rol === 'docente') {
      const docente = await Docente.findOne({ where: { email: usuario.email } });
      if (docente) idPerfil = docente.id_docente;
    } else if (usuario.rol === 'tutor') {
      const tutor = await Tutor.findOne({ where: { email: usuario.email } });
      if (tutor) idPerfil = tutor.id_tutor;
    }

    const nuevoRefreshToken = crearRefreshToken();
    await guardarSesion(usuario.id_usuario, nuevoRefreshToken, req);
    res.cookie('refreshToken', nuevoRefreshToken, cookieOptions);

    return res.status(200).send({
      accessToken: crearAccessToken(usuario, idPerfil)
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies && req.cookies.refreshToken;

    if (refreshToken) {
      await Sesion.update(
        { revocado: true },
        { where: { token_hash: hashRefreshToken(refreshToken) } }
      );
    }

    res.clearCookie('refreshToken', cookieOptions);
    return res.status(200).send({
      ok: true,
      mensaje: 'Sesión finalizada con éxito'
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
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