require('dotenv').config();

module.exports = {
  // 1. Entorno LOCAL (Tu computadora) - SE MANTIENE SIN CAMBIOS
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // <--- Tu variable preferida
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  },
  
  // 2. Entorno de PRUEBAS - SE MANTIENE SIN CAMBIOS
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  },
  
  // 3. Entorno de PRODUCCIÓN (Render / La Nube) - ¡EL CAMBIO!
  production: {
    // CAMBIO 1: Decimos a Sequelize que use la variable unificada
    use_env_variable: 'DATABASE_URL', 
    
    dialect: 'postgres',
    
    // CAMBIO 2: Mantenemos la configuración SSL
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};