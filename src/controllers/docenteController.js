const db = require('../models')
const Docente = db.tb_docentes;

// 1. CREAR un docente
exports.create = async (req, res) => {
  try {
    // Validar campos obligatorios
    if (!req.body.nombre || !req.body.apellidos) {
      return res.status(400).send({
        message: "El nombre y los apellidos son obligatorios."
      });
    }

    const docente = {
      nombre: req.body.nombre,
      apellidos: req.body.apellidos
    };

    const data = await Docente.create(docente);
    res.status(201).send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al crear el docente."
    });
  }
};

// 2. OBTENER TODOS los docentes
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

// 3. OBTENER UNO por id
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

// 5. ELIMINAR un docente
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Docente.destroy({
      where: { id_docente: id }
    });

    if (num == 1) {
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