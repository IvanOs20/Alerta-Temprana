const db = require('../models');
const Notificacion = db.tb_notificaciones;
const Docente = db.tb_docentes;
const Alumno = db.tb_alumnos;

// 1. CREAR una notificación
exports.create = async (req, res) => {
  try {
    // Validar campos obligatorios básicos
    if (!req.body.id_docente || !req.body.id_alumno || !req.body.mensaje) {
      return res.status(400).send({
        message: "Faltan datos: id_docente, id_alumno y mensaje son requeridos."
      });
    }

    // Calcular Fecha y Hora actuales automáticamente
    const now = new Date();
    // Formato YYYY-MM-DD para DATEONLY
    const fechaActual = now.toISOString().split('T')[0]; 
    // Formato HH:MM:SS para TIME
    const horaActual = now.toTimeString().split(' ')[0];

    const notificacionData = {
      id_docente: req.body.id_docente,
      id_alumno: req.body.id_alumno,
      mensaje: req.body.mensaje,
      fecha_envio: fechaActual, // Se llena automático
      hora_envio: horaActual    // Se llena automático
    };

    const data = await Notificacion.create(notificacionData);
    res.status(201).send(data);

  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al crear la notificación."
    });
  }
};

// 2. OBTENER TODAS las notificaciones (Para Admin)
exports.findAll = async (req, res) => {
  try {
    const data = await Notificacion.findAll({
      include: [
        { model: Docente, attributes: ['nombre', 'apellidos'] }, // Ver quién la envió
        { model: Alumno, attributes: ['nombre', 'apellidos'] }   // Ver a quién se envió
      ],
      order: [['fecha_envio', 'DESC'], ['hora_envio', 'DESC']] // Las más recientes primero
    });
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: "Error al obtener las notificaciones."
    });
  }
};

// 3. OBTENER notificaciones DE UN ALUMNO (Bandeja de entrada del alumno)
exports.findByAlumno = async (req, res) => {
  const id_alumno = req.params.id;

  try {
    const data = await Notificacion.findAll({
      where: { id_alumno: id_alumno },
      include: [
        { model: Docente, attributes: ['nombre', 'apellidos'] } // Para que el alumno sepa qué profe le escribió
      ],
      order: [['fecha_envio', 'DESC'], ['hora_envio', 'DESC']]
    });
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: "Error al obtener la bandeja del alumno."
    });
  }
};

// 4. ELIMINAR una notificación
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Notificacion.destroy({
      where: { id_notificacion: id }
    });

    if (num == 1) {
      res.send({ message: "Notificación eliminada correctamente." });
    } else {
      res.send({ message: `No se encontró la notificación con id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al eliminar la notificación."
    });
  }
};