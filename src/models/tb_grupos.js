'use strict';

module.exports = (sequelize, DataTypes) => {
  const tb_grupos = sequelize.define('tb_grupos', {
    id_grupo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_docente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    grado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    grupo: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tb_grupos',
    timestamps: false
  });

  tb_grupos.associate = function(models) {
    // Un grupo pertenece a un docente
    tb_grupos.belongsTo(models.tb_docentes, {
      foreignKey: 'id_docente',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Un grupo tiene varios alumnos
    tb_grupos.hasMany(models.tb_alumnos, {
      foreignKey: 'id_grupo',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return tb_grupos;
};
