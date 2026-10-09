// crearAdmin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/models');
const Usuario = db.tb_usuarios;

async function crearOSincronizarAdmin() {
  try {
    // 1. Obtención de credenciales de forma segura
    // Prioridad: argumento de consola > variable de entorno > valor por defecto
    const email = process.env.ADMIN_EMAIL || process.argv[2] || 'admin@sigejod.com';
    const password = process.env.ADMIN_PASSWORD || process.argv[3];

    if (!password) {
      console.error('❌ Error: Debes proporcionar una contraseña para el administrador.');
      console.log('\nModo de uso:');
      console.log('  node crearAdmin.js "admin@sigejod.com" "TuPasswordFuerte123"');
      console.log('O mediante variable de entorno:');
      console.log('  ADMIN_PASSWORD="TuPasswordFuerte123" node crearAdmin.js\n');
      process.exit(1);
    }

    // 2. Cifrado de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear o actualizar (upsert)
    const [usuario, creado] = await Usuario.findOrCreate({
      where: { email },
      defaults: {
        nombre_completo: 'Administrador General',
        email,
        password: hashedPassword,
        rol: 'admin',
        cuenta_activa: true,
        token_activacion: null
      }
    });

    if (!creado) {
      await usuario.update({
        password: hashedPassword,
        cuenta_activa: true,
        token_activacion: null
      });
      console.log(`🔄 El usuario administrador (${email}) ya existía: su contraseña y activación fueron actualizadas.`);
    } else {
      console.log(`✅ Administrador (${email}) creado exitosamente con rol 'admin'.`);
    }

    // 4. Cerrar conexión limpiamente
    if (db.sequelize) {
      await db.sequelize.close();
    }
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al procesar el usuario administrador:', error.message);
    if (db.sequelize) {
      await db.sequelize.close();
    }
    process.exit(1);
  }
}

crearOSincronizarAdmin();