// src/testConnection.js
const { sequelize } = require('../models'); // usamos la instancia global con modelos

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado correctamente a la base de datos.');
  } catch (error) {
    console.error('Error de conexión:', error.message);
  } finally {
    await sequelize.close();
  }
})();
