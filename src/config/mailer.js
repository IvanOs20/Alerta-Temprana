const nodemailer = require("nodemailer");

// 1. Configuración del transporte (Tus credenciales reales)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true, 
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS, 
  },
});

// 2. Función para enviar el correo de activación
const enviarCorreoActivacion = async (emailDestino, nombre, token) => {
  try {
    // URL del Frontend donde el usuario pondrá su contraseña nueva
    const urlActivacion = `http://192.168.59.187:5173/activar-cuenta?token=${token}`;

    const info = await transporter.sendMail({
      from: '"Sistema Escolar 🏫" <tu_correo_real@gmail.com>',
      to: emailDestino,
      subject: "Active su cuenta - Sistema Escolar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">¡Bienvenido al Sistema Escolar, ${nombre}!</h2>
          <p>Se ha creado un perfil para usted. Para acceder, es necesario que active su cuenta y defina su contraseña personal.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <p style="margin-bottom: 15px;">Haga clic en el siguiente botón para activar:</p>
            <a href="${urlActivacion}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Activar Cuenta y Crear Contraseña</a>
          </div>

          <p style="font-size: 12px; color: #7f8c8d;">Si el botón no funciona, copie y pegue este enlace: <br> ${urlActivacion}</p>
          <p>Este enlace expirará en 24 horas por seguridad.</p>
        </div>
      `,
    });
    console.log("Correo de activación enviado: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error enviando correo: ", error);
    return false;
  }
};

module.exports = { transporter, enviarCorreoActivacion };