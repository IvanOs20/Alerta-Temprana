'use strict';

module.exports = (sequelize, DataTypes) => {
  const tb_tutores = sequelize.define('tb_tutores', {
    id_tutor: {
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
    email: {
      type: DataTypes.STRING,
      allowNull: false, 
      unique: true      
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tb_tutores',
    timestamps: false
  });

  tb_tutores.associate = function(models) {
    tb_tutores.hasMany(models.tb_alumnos, {
      foreignKey: 'id_tutor',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return tb_tutores;
};
