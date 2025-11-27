const db = require('../models')
const Tutor = db.tb_tutores;
const Alumno = db.tb_alumnos;

// 1. CREAR un tutor
exports.create = async (req, res) => {
  try {
    // Validar campos obligatorios
    if (!req.body.nombre || !req.body.apellidos) {
      return res.status(400).send({
        message: "Nombre y apellidos son obligatorios."
      });
    }

    const nuevoTutor = {
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      telefono: req.body.telefono // Este es opcional, puede ir null
    };

    const data = await Tutor.create(nuevoTutor);
    res.status(201).send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al crear el tutor."
    });
  }
};

// 2. OBTENER TODOS los tutores
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

// 3. OBTENER UNO por id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Tutor.findByPk(id, {
      include: [
        { model: Alumno } // Muestra los alumnos que tiene a cargo este tutor
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

// 4. ACTUALIZAR un tutor
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

// 5. ELIMINAR un tutor
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