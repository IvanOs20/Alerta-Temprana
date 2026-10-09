'use strict';

module.exports = (sequelize, DataTypes) => {
  const tb_sesiones = sequelize.define('tb_sesiones', {
    id_sesion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tb_usuarios',
        key: 'id_usuario'
      }
    },
    token_hash: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    revocado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    expira_en: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tb_sesiones',
    timestamps: true
  });

  tb_sesiones.associate = (models) => {
    tb_sesiones.belongsTo(models.tb_usuarios, { foreignKey: 'id_usuario' });
  };

  return tb_sesiones;
};
