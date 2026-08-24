const db = require('../models');
const Notificacion = db.tb_notificaciones;
const Docente = db.tb_docentes;
const Alumno = db.tb_alumnos;

// 1. CREAR una notificación
exports.create = async (req, res) => {
  try {
    // Tomar id_docente del token JWT (req.id_perfil) o del body como respaldo
    const id_docente = req.id_perfil || req.idPerfil || req.body.id_docente;

    // Validar campos obligatorios básicos
    if (!id_docente || !req.body.id_alumno || !req.body.mensaje) {
      return res.status(400).send({
        message: "Faltan datos: id_docente, id_alumno y mensaje son requeridos."
      });
    }

    // Calcular Fecha y Hora actuales automáticamente
    const now = new Date();
    const fechaActual = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const horaActual = now.toTimeString().split(' ')[0];   // Formato HH:MM:SS

    const notificacionData = {
      id_docente: Number(id_docente),
      id_alumno: req.body.id_alumno,
      mensaje: req.body.mensaje,
      fecha_envio: fechaActual,
      hora_envio: horaActual
    };

    const data = await Notificacion.create(notificacionData);
    res.status(201).send(data);

  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al crear la notificación."
    });
  }
};

// 2. OBTENER TODAS las notificaciones (Filtrado seguro por Docente)
exports.findAll = async (req, res) => {
  const rol = (req.rol || req.userRol || '').toLowerCase();
  const idDocente = req.id_perfil || req.idPerfil;

  try {
    let condicionWhere = {};

    // Filtrar por id_docente ÚNICAMENTE si quien consulta es un Docente
    if (rol === 'docente') {
      if (idDocente) {
        condicionWhere.id_docente = Number(idDocente);
      }
    }

    const data = await Notificacion.findAll({
      where: condicionWhere,
      include: [
        { model: Docente, attributes: ['nombre', 'apellidos'] },
        { model: Alumno, attributes: ['nombre', 'apellidos'] }
      ],
      order: [['fecha_envio', 'DESC'], ['hora_envio', 'DESC']]
    });

    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: "Error al obtener las notificaciones.",
      error: error.message
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
        { model: Docente, attributes: ['nombre', 'apellidos'] },
        { model: Alumno, attributes: ['nombre', 'apellidos'] } // ✅ Agregado 
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