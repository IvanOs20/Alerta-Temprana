const db = require('../models');
const Notificacion = db.tb_notificaciones;
const Docente = db.tb_docentes;
const Alumno = db.tb_alumnos;

// 1. CREAR una notificación
exports.create = async (req, res) => {
  try {
    if (!['docente', 'admin'].includes(req.userRol)) {
      return res.status(403).send({ message: "No autorizado" });
    }

    const id_docente = req.userRol === 'admin'
      ? Number(req.body.id_docente)
      : Number(req.idPerfil);
    const idAlumno = Number(req.body.id_alumno);

    // Validar campos obligatorios básicos
    if (!id_docente || !idAlumno || !req.body.mensaje) {
      return res.status(400).send({
        message: "Faltan datos: id_docente, id_alumno y mensaje son requeridos."
      });
    }

    if (req.userRol === 'docente') {
      const alumno = await Alumno.findOne({
        where: { id_alumno: idAlumno },
        include: [{
          model: db.tb_grupos,
          where: { id_docente: id_docente },
          required: true
        }]
      });

      if (!alumno) {
        return res.status(403).send({ message: "No autorizado" });
      }
    }

    // Calcular Fecha y Hora actuales automáticamente
    const now = new Date();
    const fechaActual = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const horaActual = now.toTimeString().split(' ')[0];   // Formato HH:MM:SS

    const notificacionData = {
      id_docente: Number(id_docente),
      id_alumno: idAlumno,
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
    } else if (rol === 'tutor') {
      const alumnos = await Alumno.findAll({
        attributes: ['id_alumno'],
        where: { id_tutor: Number(req.idPerfil) },
        raw: true
      });
      condicionWhere.id_alumno = alumnos.map(alumno => alumno.id_alumno);
    } else if (rol !== 'admin') {
      return res.status(403).send({ message: "No autorizado" });
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
    const alumno = await Alumno.findByPk(Number(id_alumno));

    if (!alumno) {
      return res.status(404).send({
        message: "Alumno no encontrado"
      });
    }

    if (
      req.userRol === 'tutor' &&
      alumno.id_tutor !== Number(req.idPerfil)
    ) {
      return res.status(403).send({ message: "No autorizado" });
    }

    if (req.userRol === 'docente') {
      const grupoDocente = await db.tb_grupos.findOne({
        where: {
          id_grupo: alumno.id_grupo,
          id_docente: Number(req.idPerfil)
        }
      });

      if (!grupoDocente) {
        return res.status(403).send({ message: "No autorizado" });
      }
    } else if (req.userRol !== 'admin' && req.userRol !== 'tutor') {
      return res.status(403).send({ message: "No autorizado" });
    }

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
    if (!['docente', 'admin'].includes(req.userRol)) {
      return res.status(403).send({ message: "No autorizado" });
    }

    const where = { id_notificacion: id };
    if (req.userRol === 'docente') {
      where.id_docente = Number(req.idPerfil);
    }

    const num = await Notificacion.destroy({
      where
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