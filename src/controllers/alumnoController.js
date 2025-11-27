const db = require('../models') // Asegúrate de que esta ruta apunte a tu carpeta models del root
const Alumno = db.tb_alumnos;
const Grupo = db.tb_grupos;
const Tutor = db.tb_tutores;

// 1. CREAR un nuevo alumno
exports.create = async (req, res) => {
  try {
    // Validar que lleguen los datos obligatorios
    if (!req.body.nombre || !req.body.id_grupo || !req.body.id_tutor) {
      return res.status(400).send({
        message: "Faltan campos obligatorios (nombre, id_grupo o id_tutor)."
      });
    }

    // Crear objeto a guardar
    const alumnoData = {
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      id_grupo: req.body.id_grupo,
      id_tutor: req.body.id_tutor
    };

    // Guardar en base de datos
    const data = await Alumno.create(alumnoData);
    res.status(201).send(data);

  } catch (error) {
    res.status(500).send({
      message: error.message || "Ocurrió un error al crear el alumno."
    });
  }
};

// 2. OBTENER TODOS los alumnos
exports.findAll = async (req, res) => {
  try {
    const data = await Alumno.findAll({
      // Opcional: Incluir datos de las tablas relacionadas (JOINs)
      include: [
        { model: Grupo }, // Para ver info del grupo
        { model: Tutor }  // Para ver info del tutor
      ]
    });
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al obtener los alumnos."
    });
  }
};

// 3. OBTENER UN alumno por ID (PK: id_alumno)
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Alumno.findByPk(id, {
      include: [
        { model: Grupo },
        { model: Tutor }
      ]
    });

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró el alumno con id=${id}.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al buscar el alumno con id=" + id
    });
  }
};

// 4. ACTUALIZAR un alumno
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    // update devuelve un array con el número de filas afectadas
    const [num] = await Alumno.update(req.body, {
      where: { id_alumno: id }
    });

    if (num == 1) {
      res.send({
        message: "El alumno fue actualizado correctamente."
      });
    } else {
      res.send({
        message: `No se pudo actualizar el alumno con id=${id}. Tal vez no existe o el body está vacío.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error actualizando el alumno con id=" + id
    });
  }
};

// 5. ELIMINAR un alumno
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Alumno.destroy({
      where: { id_alumno: id }
    });

    if (num == 1) {
      res.send({
        message: "El alumno fue eliminado correctamente."
      });
    } else {
      res.send({
        message: `No se pudo eliminar el alumno con id=${id}. Tal vez no fue encontrado.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "No se pudo eliminar el alumno con id=" + id
    });
  }
};