'use strict';

module.exports = (sequelize, DataTypes) => {
  const tb_usuarios = sequelize.define('tb_usuarios', {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Nombre opcional, sirve para que el admin identifique rápido al usuario
    nombre_completo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // EL PUENTE LÓGICO con Docentes/Tutores
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rol: {
      type: DataTypes.STRING, // 'admin', 'docente', 'tutor'
      allowNull: false
    },
    // --- CAMPOS PARA EL FLUJO DE ACTIVACIÓN ---
    token_activacion: {
      type: DataTypes.STRING,
      allowNull: true // Se borrará una vez que active la cuenta
    },
    cuenta_activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: false // Nace desactivada hasta que den clic al correo
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true // Estará vacío hasta que el usuario pida resetear
    },
    resetPasswordExpires: {
      type: DataTypes.DATE, // Guarda fecha y hora exacta
      allowNull: true
    }

  }, {
    tableName: 'tb_usuarios',
    timestamps: false
  });

  return tb_usuarios;
};