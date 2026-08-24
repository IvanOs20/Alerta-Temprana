const nodemailer = require("nodemailer");

// 🌐 Base URL dinámica: Usa CLIENT_URL en producción o localhost en desarrollo
const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";

// 1. Configuración del transporte con POOL de conexiones
const transporter = nodemailer.createTransport({
  pool: true,             // Mantiene conexiones TCP activas y evita reconexiones lentas[cite: 5]
  maxConnections: 5,      // Hasta 5 conexiones simultáneas
  maxMessages: 100,       // Reutiliza la conexión hasta 100 envíos
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 465,
  secure: true, 
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 2. ACTIVACIÓN (Cuenta nueva)
const enviarCorreoActivacion = async (emailDestino, nombre, token) => {
  try {
    const urlActivacion = `${FRONTEND_URL}/activar-cuenta?token=${token}`; 
    console.log("🔗 URL DE ACTIVACIÓN:", urlActivacion);

    await transporter.sendMail({
      from: `"Sistema Escolar 🏫" <${process.env.MAIL_USER || 'sistema.josefaortiz@gmail.com'}>`,
      to: emailDestino,
      subject: "Active su cuenta - Sistema Escolar",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3>Bienvenido ${nombre}</h3>
          <p>Haga clic en el botón de abajo para activar su cuenta:</p>
          <a href="${urlActivacion}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Activar Cuenta</a>
          <br><br>
          <p style="color: #666; font-size: 14px;">Si el botón no funciona, copia y pega este enlace completo en tu navegador:</p>
          <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all;">
            <strong>${urlActivacion}</strong>
          </p>
        </div>
      `,
    });
    console.log("✅ Correo de activación enviado a:", emailDestino);
    return true;
  } catch (error) {
    console.error("❌ Error enviando activación:", error);
    return false;
  }
};

// 3. RECUPERACIÓN (Olvido Password)
const enviarCorreoRecuperacion = async (emailDestino, nombre, token) => {
  try {
    const urlRecuperacion = `${FRONTEND_URL}/reset-password/${token}`; 
    console.log("🔗 URL DE RECUPERACIÓN:", urlRecuperacion);

    await transporter.sendMail({
      from: `"Sistema Escolar 🏫" <${process.env.MAIL_USER || 'sistema.josefaortiz@gmail.com'}>`,
      to: emailDestino,
      subject: "Restablecer Contraseña 🔐",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3 style="color: #d9534f;">Recuperación de Acceso</h3>
          <p>Hola ${nombre}, solicitaste restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <a href="${urlRecuperacion}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
          <br><br>
          <p style="color: #666; font-size: 14px;">Si el botón no funciona, copia y pega este enlace completo en tu navegador:</p>
          <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all;">
            <strong>${urlRecuperacion}</strong>
          </p>
        </div>
      `,
    });
    console.log("✅ Correo de recuperación enviado a:", emailDestino);
    return true;
  } catch (error) {
    console.error("❌ Error enviando recuperación:", error);
    return false;
  }
};

module.exports = { 
  transporter, 
  enviarCorreoActivacion,
  enviarCorreoRecuperacion 
};