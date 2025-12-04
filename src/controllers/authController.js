const db = require('../models');
const Usuario = db.tb_usuarios;
const Docente = db.tb_docentes;
const Tutor = db.tb_tutores;
const Alumno = db.tb_alumnos; // <--- Importante para buscar los hijos
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

    // B. Encriptar la nueva contraseña que eligió el usuario
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    // C. Actualizar el usuario: Poner password, activar cuenta y borrar token
    await Usuario.update(
      { 
        password: hashedPassword,
        cuenta_activa: true,
        token_activacion: null // Borramos el token para que no se use dos veces
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

    // B. Verificar si la cuenta está activa (Seguridad Extra)
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
    // Inicializamos en NULL para diferenciar si buscamos o no
    let hijosEncontrados = null; 

    if (usuario.rol === 'docente') {
      const docente = await Docente.findOne({ where: { email: email } });
      if (docente) idPerfil = docente.id_docente;
      // Aquí NO buscamos hijos, así que la variable sigue siendo null
    } 
    else if (usuario.rol === 'tutor') {
      const tutor = await Tutor.findOne({ where: { email: email } });
      
      if (tutor) {
        idPerfil = tutor.id_tutor;
        
        // --- AQUÍ ESTÁ LA LÓGICA DE HIJOS ---
        // Buscamos automáticamente a todos los hijos de este tutor
        hijosEncontrados = await Alumno.findAll({
          where: { id_tutor: idPerfil },
          attributes: ['id_alumno', 'nombre', 'apellidos'] // Solo traemos lo necesario
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

    // F. CONSTRUIR RESPUESTA DINÁMICA
    // Creamos el objeto base que siempre se envía
    const dataResponse = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre_completo,
      email: usuario.email,
      rol: usuario.rol,
      id_perfil: idPerfil,
      accessToken: token
    };

    // Solo si es tutor (hijosEncontrados no es null), agregamos el campo al JSON
    if (hijosEncontrados !== null) {
      dataResponse.hijos = hijosEncontrados;
    }

    // Enviamos el paquete
    res.status(200).send(dataResponse);

  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};