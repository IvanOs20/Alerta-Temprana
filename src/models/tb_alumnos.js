'use strict';

module.exports = (sequelize, DataTypes) => {
  const tb_alumnos = sequelize.define('tb_alumnos', {
    id_alumno: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_grupo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_tutor: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'tb_alumnos',
    timestamps: false
  });

  tb_alumnos.associate = function(models) {
    // Un alumno pertenece a un grupo
    tb_alumnos.belongsTo(models.tb_grupos, {
      foreignKey: 'id_grupo',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Un alumno pertenece a un tutor
    tb_alumnos.belongsTo(models.tb_tutores, {
      foreignKey: 'id_tutor',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Un alumno tiene muchas notificaciones
    tb_alumnos.hasMany(models.tb_notificaciones, {
      foreignKey: 'id_alumno',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Relación N:M con materias
    tb_alumnos.belongsToMany(models.tb_materias, {
      through: models.tb_alumno_materia,
      foreignKey: 'id_alumno',
      otherKey: 'id_materia'
    });
  };

  return tb_alumnos;
};
