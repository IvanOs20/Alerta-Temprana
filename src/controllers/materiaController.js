const db = require('../models');
const Materia = db.tb_materias;
const Alumno = db.tb_alumnos;

// 1. CREAR una materia
exports.create = async (req, res) => {
  try {
    // Validar
    if (!req.body.nombre_materia) {
      return res.status(400).send({
        message: "El nombre de la materia es obligatorio."
      });
    }

    const nuevaMateria = {
      nombre_materia: req.body.nombre_materia
    };

    const data = await Materia.create(nuevaMateria);
    res.status(201).send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al crear la materia."
    });
  }
};

// 2. OBTENER TODAS las materias
exports.findAll = async (req, res) => {
  try {
    const data = await Materia.findAll(); // Aquí usualmente no traemos alumnos para no saturar la lista
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al obtener las materias."
    });
  }
};

// 3. OBTENER UNA materia por id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Materia.findByPk(id, {
      // Esto intentará traer a los alumnos inscritos (requiere que la tabla intermedia tb_alumno_materia esté lista)
      include: [
        {
          model: Alumno,
          as: 'tb_alumnos', // Sequelize a veces requiere el alias exacto de la relación
          through: { attributes: [] } // Esto oculta los datos de la tabla intermedia para limpiar la respuesta
        }
      ]
    });

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró la materia con id=${id}.`
      });
    }
  } catch (error) {
    // Nota: Si esto falla, es probable que sea porque la tabla intermedia tb_alumno_materia aún no está cargada completamente.
    // Si da error, temporalmente quita la parte de "include".
    res.status(500).send({
      message: "Error al buscar la materia con id=" + id,
      error: error.message
    });
  }
};

// 4. ACTUALIZAR una materia
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const [num] = await Materia.update(req.body, {
      where: { id_materia: id }
    });

    if (num == 1) {
      res.send({ message: "Materia actualizada correctamente." });
    } else {
      res.send({ message: `No se pudo actualizar la materia con id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error actualizando la materia con id=" + id
    });
  }
};

// 5. ELIMINAR una materia
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Materia.destroy({
      where: { id_materia: id }
    });

    if (num == 1) {
      res.send({ message: "Materia eliminada correctamente." });
    } else {
      res.send({ message: `No se pudo eliminar la materia con id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({
      message: "No se puede eliminar la materia (posiblemente hay alumnos inscritos)."
    });
  }
};