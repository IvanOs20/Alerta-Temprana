// crearAdmin.js
const db = require('./src/models'); // Asegúrate que la ruta sea correcta
const Usuario = db.tb_usuarios;
const bcrypt = require('bcryptjs');

const crearSuperAdmin = async () => {
  try {
    // 1. Datos del Super Admin
    const emailAdmin = "admin@escuela.com";
    const passwordAdmin = "AdminSeguro123"; // <--- Esta será tu contraseña maestra

    // 2. Encriptamos la contraseña (¡Obligatorio!)
    const hashedPassword = await bcrypt.hash(passwordAdmin, 10);

    // 3. Verificamos si ya existe para no duplicarlo
    const existe = await Usuario.findOne({ where: { email: emailAdmin } });
    if (existe) {
      console.log("⚠️  El usuario Admin ya existe en la base de datos.");
      return;
    }

    // 4. Creamos el usuario con rol 'admin' y cuenta activa
    await Usuario.create({
      nombre_completo: "Super Administrador",
      email: emailAdmin,
      password: hashedPassword,
      rol: "admin",         // <--- AQUÍ ESTÁ LA CLAVE
      cuenta_activa: true,  // Nace activo, no necesita correo
      token_activacion: null
    });

    console.log("✅ ¡Administrador creado con éxito!");
    console.log(`📧 Email: ${emailAdmin}`);
    console.log(`🔑 Password: ${passwordAdmin}`);

  } catch (error) {
    console.error("❌ Error al crear admin:", error);
  }
};

// Ejecutamos la función
crearSuperAdmin();