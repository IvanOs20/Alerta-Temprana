require('dotenv').config();

module.exports = {
  // 1. Entorno LOCAL (Tu computadora)
  // Aquí NO usamos SSL para que no te de problemas con tu PGAdmin local
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // <--- Usamos tu variable preferida
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  },
  
  // 2. Entorno de PRUEBAS
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  },
  
  // 3. Entorno de PRODUCCIÓN (Render / La Nube)
  // Aquí SÍ agregamos la configuración de seguridad obligatoria
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // <--- Usamos tu variable preferida
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    // ESTO ES LO NUEVO (Solo afecta a la nube):
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};