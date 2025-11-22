'use strict';

module.exports = (sequelize, DataTypes) => {
  const tb_docentes = sequelize.define('tb_docentes', {
    id_docente: {
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
    }
  }, {
    tableName: 'tb_docentes',
    timestamps: false
  });

  tb_docentes.associate = function(models) {
    tb_docentes.hasMany(models.tb_grupos, {
      foreignKey: 'id_docente',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    tb_docentes.hasMany(models.tb_notificaciones, {
      foreignKey: 'id_docente',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return tb_docentes;
};
