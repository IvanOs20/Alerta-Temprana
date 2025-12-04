const db = require('../models');
const Docente = db.tb_docentes;
const Usuario = db.tb_usuarios; // Necesario para crear la cuenta de acceso
const crypto = require('crypto'); // Para generar el token aleatorio
const bcrypt = require('bcryptjs'); // Para la contraseña temporal
const { enviarCorreoActivacion } = require('../config/mailer'); // El cartero

// 1. CREAR DOCENTE Y DISPARAR CORREO DE ACTIVACIÓN (MODIFICADO)
exports.create = async (req, res) => {
  try {
    const { nombre, apellidos, email } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellidos || !email) {
      return res.status(400).send({
        message: "El nombre, los apellidos y el email son obligatorios."
      });
    }

    // A. Crear el Docente en la tabla de negocio
    const nuevoDocente = await Docente.create({
      nombre: nombre,
      apellidos: apellidos,
      email: email
    });

    // B. Generar Token de Activación (32 bytes en hex)
    const token = crypto.randomBytes(32).toString('hex');

    // C. Generar contraseña temporal encriptada (nadie la usará, es relleno)
    const dummyPassword = await bcrypt.hash("PENDIENTE_" + Date.now(), 10);

    // D. Crear el Usuario INACTIVO en tb_usuarios
    await Usuario.create({
      nombre_completo: `${nombre} ${apellidos}`,
      email: email, // El mismo email sirve de enlace
      password: dummyPassword,
      rol: 'docente',
      token_activacion: token,
      cuenta_activa: false // Importante: Nace desactivada
    });

    // E. Enviar el correo con el link
    // Nota: Usamos await para asegurar que si falla el correo, nos enteremos en el log
    await enviarCorreoActivacion(email, `${nombre} ${apellidos}`, token);

    res.status(201).send({
      message: "Docente registrado exitosamente. Se ha enviado el correo de activación.",
      docente: nuevoDocente
    });

  } catch (error) {
    console.error(error); // Para ver el error en consola si falla el correo
    res.status(500).send({
      message: error.message || "Error al crear el docente."
    });
  }
};

// 2. OBTENER TODOS los docentes (SIN CAMBIOS)
exports.findAll = async (req, res) => {
  try {
    const data = await Docente.findAll();
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al obtener docentes."
    });
  }
};

// 3. OBTENER UNO por id (SIN CAMBIOS)
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Docente.findByPk(id);

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

// 4. ACTUALIZAR un docente (SIN CAMBIOS)
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const [num] = await Docente.update(req.body, {
      where: { id_docente: id }
    });

    if (num == 1) {
      // Opcional: Podrías agregar lógica aquí para actualizar también el email en tb_usuarios si cambia
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

// 5. ELIMINAR un docente (SIN CAMBIOS)
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Docente.destroy({
      where: { id_docente: id }
    });

    if (num == 1) {
      // Nota: Si borras al docente, deberías considerar borrar también al usuario asociado manualmente
      // o dejarlo. Por ahora lo dejamos simple.
      res.send({ message: "Docente eliminado correctamente." });
    } else {
      res.send({ message: `No se pudo eliminar. Tal vez el id=${id} no existe.` });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al eliminar docente con id=" + id
    });
  }
};