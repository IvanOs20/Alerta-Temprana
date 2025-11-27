// src/test/testConnection.js
const db = require('../models'); // Importa toda la instancia de modelos

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Conectado correctamente a la base de datos.');
  } catch (error) {
    console.error('Error de conexión:', error.message);
  } finally {
    await db.sequelize.close();
  }
})();
