const db = require('../models');
const Tutor = db.tb_tutores;
const Alumno = db.tb_alumnos;
const Usuario = db.tb_usuarios;
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { enviarCorreoActivacion } = require('../config/mailer');

// 1. CREAR TUTOR Y DISPARAR CORREO DE ACTIVACIÓN (OPTIMIZADO)
exports.create = async (req, res) => {
  try {
    const { nombre, apellidos, email, telefono } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellidos || !email) {
      return res.status(400).send({
        message: "Nombre, apellidos y email son obligatorios."
      });
    }

    // A. Crear el Tutor en la tabla de negocio
    const nuevoTutor = await Tutor.create({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono ? telefono.trim() : null
    });

    // B. Generar Token de Activación
    const token = crypto.randomBytes(32).toString('hex');

    // C. Generar contraseña temporal encriptada
    const dummyPassword = await bcrypt.hash("PENDIENTE_" + Date.now(), 10);

    // D. Crear el Usuario INACTIVO vinculado con su id_perfil
    await Usuario.create({
      nombre_completo: `${nombre.trim()} ${apellidos.trim()}`,
      email: email.trim().toLowerCase(),
      password: dummyPassword,
      rol: 'tutor',
      id_perfil: nuevoTutor.id_tutor, // 👈 Enlace indispensable para JWT y sesión
      token_activacion: token,
      cuenta_activa: false
    });

    // E. Responder inmediatamente al cliente (< 50ms)
    res.status(201).send({
      message: "Tutor registrado exitosamente. Se ha enviado el correo de activación.",
      tutor: nuevoTutor
    });

    // F. Despachar el correo en segundo plano sin bloquear la respuesta HTTP
    enviarCorreoActivacion(email, `${nombre} ${apellidos}`, token).catch((mailErr) => {
      console.error("⚠️ Error al enviar correo de activación en segundo plano:", mailErr);
    });

  } catch (error) {
    console.error("❌ Error al crear el tutor:", error);
    res.status(500).send({
      message: error.message || "Error al crear el tutor."
    });
  }
};

// 2. OBTENER TODOS los tutores (SIN CAMBIOS)
exports.findAll = async (req, res) => {
  try {
    const data = await Tutor.findAll();
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al obtener tutores."
    });
  }
};

// 3. OBTENER UNO por id (SIN CAMBIOS)
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Tutor.findByPk(id, {
      include: [
        { model: Alumno } // Muestra los alumnos a cargo
      ]
    });

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró el tutor con id=${id}.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al buscar el tutor con id=" + id
    });
  }
};

// 4. ACTUALIZAR un tutor (SIN CAMBIOS)
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const [num] = await Tutor.update(req.body, {
      where: { id_tutor: id }
    });

    if (num == 1) {
      res.send({ message: "Tutor actualizado correctamente." });
    } else {
      res.send({ message: `No se pudo actualizar el tutor con id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al actualizar el tutor con id=" + id
    });
  }
};

// 5. ELIMINAR un tutor (SIN CAMBIOS)
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Tutor.destroy({
      where: { id_tutor: id }
    });

    if (num == 1) {
      res.send({ message: "Tutor eliminado correctamente." });
    } else {
      res.send({ message: `No se pudo eliminar el tutor con id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al eliminar el tutor con id=" + id
    });
  }
};