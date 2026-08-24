const db = require('../models');

// Referencias a los modelos
const AlumnoMateria = db.tb_alumno_materia;
const Alumno = db.tb_alumnos;
const Materia = db.tb_materias;

// 1. INSCRIBIR
exports.inscribir = async (req, res) => {
  try {
    const { id_alumno, id_materia, calificacion } = req.body;

    if (!id_alumno || !id_materia) {
      return res.status(400).send({
        message: "Faltan datos: se requiere id_alumno y id_materia."
      });
    }

    const data = await AlumnoMateria.create({
      id_alumno,
      id_materia,
      calificacion: calificacion || null
    });

    res.status(201).send(data);
  } catch (error) {
    res.status(500).send({
      message: "Error al inscribir. Verifica que no esté inscrito ya.",
      error: error.message
    });
  }
};

// 2. VER MATERIAS DE ALUMNO
exports.verMateriasDeAlumno = async (req, res) => {
  const { id_alumno } = req.params;
  try {
    const data = await AlumnoMateria.findAll({
      where: { id_alumno: id_alumno },
      include: [{ model: Materia }]
    });
    res.send(data);
  } catch (error) {
    res.status(500).send({ message: "Error al obtener materias." });
  }
};

// 3. VER ALUMNOS EN MATERIA (CORREGIDO AISLAMIENTO DE GRUPO)
exports.verAlumnosEnMateria = async (req, res) => {
  const { id_materia } = req.params;
  const id_docente = req.idPerfil || req.id_perfil; // Compatible con ambas convenciones

  try {
    // 1. Buscar el grupo asignado al docente titular
    const grupoDocente = await db.tb_grupos.findOne({
      where: { id_docente: id_docente }
    });

    // 🔒 Si el docente aún no tiene grupo asignado, responde lista vacía inmediatamente
    if (!grupoDocente) {
      return res.status(200).send([]);
    }

    // 2. Consultar únicamente a los alumnos inscritos que pertenecen a su salón
    const data = await AlumnoMateria.findAll({
      where: { id_materia: id_materia },
      include: [{
        model: Alumno,
        where: { id_grupo: grupoDocente.id_grupo }
      }]
    });

    res.send(data);
  } catch (error) {
    res.status(500).send({ 
      message: "Error al obtener lista de alumnos.", 
      error: error.message 
    });
  }
};

// 4. CALIFICAR
exports.calificar = async (req, res) => {
  const { id_alumno, id_materia } = req.params;
  try {
    const [actualizado] = await AlumnoMateria.update(
      { calificacion: req.body.calificacion },
      { where: { id_alumno: id_alumno, id_materia: id_materia } }
    );
    
    if (actualizado) res.send({ message: "Calificación actualizada." });
    else res.status(404).send({ message: "No se encontró la inscripción." });
  } catch (error) {
    res.status(500).send({ message: "Error al calificar." });
  }
};

// 5. DAR DE BAJA
exports.darBaja = async (req, res) => {
  const { id_alumno, id_materia } = req.params;
  try {
    const eliminado = await AlumnoMateria.destroy({
      where: { id_alumno: id_alumno, id_materia: id_materia }
    });
    
    if (eliminado) res.send({ message: "Baja realizada." });
    else res.status(404).send({ message: "No se encontró el registro." });
  } catch (error) {
    res.status(500).send({ message: "Error al dar de baja." });
  }
};