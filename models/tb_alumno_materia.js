'use strict';

module.exports = (sequelize, DataTypes) => {
  const tb_alumno_materia = sequelize.define('tb_alumno_materia', {
    id_alumno: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    id_materia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    calificacion: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    }
  }, {
    tableName: 'tb_alumno_materia',
    timestamps: false
  });

  tb_alumno_materia.associate = function(models) {
    // Cada registro pertenece a un alumno
    tb_alumno_materia.belongsTo(models.tb_alumnos, {
      foreignKey: 'id_alumno',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Cada registro pertenece a una materia
    tb_alumno_materia.belongsTo(models.tb_materias, {
      foreignKey: 'id_materia',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return tb_alumno_materia;
};
