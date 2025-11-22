'use strict';

module.exports = (sequelize, DataTypes) => {
  const tb_materias = sequelize.define('tb_materias', {
    id_materia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_materia: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tb_materias',
    timestamps: false
  });

  tb_materias.associate = function(models) {
    // Relación N:M con alumnos
    tb_materias.belongsToMany(models.tb_alumnos, {
      through: models.tb_alumno_materia,
      foreignKey: 'id_materia',
      otherKey: 'id_alumno'
    });
  };

  return tb_materias;
};
