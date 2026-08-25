const db = require('../models');
const Docente = db.tb_docentes;
const Grupo = db.tb_grupos;
const Usuario = db.tb_usuarios;
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { enviarCorreoActivacion } = require('../config/mailer');

// 1. CREAR DOCENTE Y DISPARAR CORREO DE ACTIVACIÓN (OPTIMIZADO)
exports.create = async (req, res) => {
  try {
    const { nombre, apellidos, email } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellidos || !email) {
      return res.status(400).send({
        message: "El nombre, los apellidos y el email son obligatorios."
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    // Validar si el correo ya existe en usuarios para evitar errores 500 de duplicados
    const usuarioExistente = await Usuario.findOne({ where: { email: emailNormalizado } });
    if (usuarioExistente) {
      return res.status(400).send({
        message: "El correo electrónico ya está registrado en el sistema."
      });
    }

    // A. Crear el Docente en la tabla de negocio
    const nuevoDocente = await Docente.create({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: emailNormalizado
    });

    // B. Generar Token de Activación (32 bytes en hex)
    const token = crypto.randomBytes(32).toString('hex');

    // C. Generar contraseña temporal encriptada (relleno de seguridad)
    const dummyPassword = await bcrypt.hash("PENDIENTE_" + Date.now(), 10);

    // D. Crear el Usuario INACTIVO vinculado con su id_perfil
    await Usuario.create({
      nombre_completo: `${nombre.trim()} ${apellidos.trim()}`,
      email: emailNormalizado,
      password: dummyPassword,
      rol: 'docente',
      id_perfil: nuevoDocente.id_docente,
      token_activacion: token,
      cuenta_activa: false
    });

    // E. Esperar el envío del correo antes de cerrar la petición HTTP (evita congelamiento en Render)
    await enviarCorreoActivacion(emailNormalizado, `${nombre.trim()} ${apellidos.trim()}`, token);

    // F. Responder al cliente
    res.status(201).send({
      message: "Docente registrado exitosamente. Se ha enviado el correo de activación.",
      docente: nuevoDocente
    });

  } catch (error) {
    console.error("❌ Error al crear el docente:", error);
    res.status(500).send({
      message: error.message || "Error al crear el docente."
    });
  }
};

// 2. OBTENER TODOS los docentes (CON SU GRUPO INCLUIDO)
exports.findAll = async (req, res) => {
  try {
    const data = await Docente.findAll({
      include: [
        {
          model: Grupo,
          attributes: ['id_grupo', 'grado', 'grupo']
        }
      ],
      order: [['nombre', 'ASC']]
    });
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al obtener docentes."
    });
  }
};

// 3. OBTENER UNO por id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Docente.findByPk(id, {
      include: [
        {
          model: Grupo,
          attributes: ['id_grupo', 'grado', 'grupo']
        }
      ]
    });

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró el docente con id=${id}.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al buscar el docente con id=" + id
    });
  }
};

// 4. ACTUALIZAR un docente
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const [num] = await Docente.update(req.body, {
      where: { id_docente: id }
    });

    if (num == 1) {
      res.send({ message: "Docente actualizado correctamente." });
    } else {
      res.send({ message: `No se pudo actualizar. Tal vez el id=${id} no existe.` });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error actualizando docente con id=" + id
    });
  }
};

// 5. ELIMINAR un docente (Sincronizado con tb_usuarios)
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const docente = await Docente.findByPk(id);

    if (!docente) {
      return res.status(404).send({
        message: `No se encontró el docente con id=${id}.`
      });
    }

    const email = docente.email;

    // Eliminar de tb_docentes
    await Docente.destroy({
      where: { id_docente: id }
    });

    // Eliminar también de tb_usuarios para liberar el correo
    if (email) {
      await Usuario.destroy({
        where: { email }
      });
    }

    res.send({ message: "Docente y usuario eliminados correctamente." });
  } catch (error) {
    res.status(500).send({
      message: "Error al eliminar docente con id=" + id
    });
  }
};