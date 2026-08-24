const db = require('../models');
const Grupo = db.tb_grupos;
const Docente = db.tb_docentes;
const { Op } = db.Sequelize;

// 1. CREAR un grupo
exports.create = async (req, res) => {
  try {
    // Validar campos requeridos
    if (!req.body.id_docente || !req.body.grado || !req.body.grupo) {
      return res.status(400).send({
        message: "Faltan campos: id_docente, grado o grupo son obligatorios."
      });
    }

    // Validar si el docente ya tiene un grupo asignado
    const docenteOcupado = await Grupo.findOne({
      where: { id_docente: Number(req.body.id_docente) }
    });

    if (docenteOcupado) {
      return res.status(400).send({
        message: `El docente seleccionado ya es titular del grupo ${docenteOcupado.grado} "${docenteOcupado.grupo}".`
      });
    }

    const nuevoGrupo = {
      id_docente: req.body.id_docente,
      grado: req.body.grado,
      grupo: req.body.grupo
    };

    const data = await Grupo.create(nuevoGrupo);
    res.status(201).send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al crear el grupo."
    });
  }
};

// 2. OBTENER TODOS los grupos
exports.findAll = async (req, res) => {
  try {
    const data = await Grupo.findAll({
      include: [
        { model: Docente } // Trae la info del maestro asignado
      ]
    });
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error al obtener los grupos."
    });
  }
};

// 3. OBTENER UNO por id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Grupo.findByPk(id, {
      include: [
        { model: Docente }
      ]
    });

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró el grupo con id=${id}.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al buscar el grupo con id=" + id
    });
  }
};

// 4. ACTUALIZAR un grupo
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    // Si se envía id_docente, validar que no pertenezca a OTRO grupo
    if (req.body.id_docente) {
      const docenteOcupado = await Grupo.findOne({
        where: {
          id_docente: Number(req.body.id_docente),
          id_grupo: { [Op.ne]: id } // Excluye el grupo actual que se está modificando
        }
      });

      if (docenteOcupado) {
        return res.status(400).send({
          message: `El docente ya está a cargo del grupo ${docenteOcupado.grado} "${docenteOcupado.grupo}".`
        });
      }
    }

    const [num] = await Grupo.update(req.body, {
      where: { id_grupo: id }
    });

    if (num == 1) {
      res.send({ message: "Grupo actualizado correctamente." });
    } else {
      res.send({ message: `No se pudo actualizar el grupo con id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al actualizar el grupo con id=" + id
    });
  }
};

// 5. ELIMINAR un grupo
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Grupo.destroy({
      where: { id_grupo: id }
    });

    if (num == 1) {
      res.send({ message: "Grupo eliminado correctamente." });
    } else {
      res.send({ message: `No se pudo eliminar el grupo con id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al eliminar el grupo con id=" + id
    });
  }
};