'use strict';

module.exports = (sequelize, DataTypes) => {
  const tb_notificaciones = sequelize.define('tb_notificaciones', {
    id_notificacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_docente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_alumno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fecha_envio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hora_envio: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    tableName: 'tb_notificaciones',
    timestamps: false
  });

  tb_notificaciones.associate = function(models) {
    // Una notificación pertenece a un docente
    tb_notificaciones.belongsTo(models.tb_docentes, {
      foreignKey: 'id_docente',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Una notificación pertenece a un alumno
    tb_notificaciones.belongsTo(models.tb_alumnos, {
      foreignKey: 'id_alumno',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return tb_notificaciones;
};
