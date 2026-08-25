const nodemailer = require("nodemailer");

// 🌐 Base URL dinámica: Usa CLIENT_URL en producción o localhost en desarrollo
const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";

// 1. Configuración del transporte optimizada para Gmail en la nube
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER || process.env.EMAIL_USER, 
    pass: process.env.MAIL_PASS || process.env.EMAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false
  },
  family: 4,               // ⚡ Forzar IPv4 para evitar bloqueos/hangs de red en Render
  connectionTimeout: 10000, // 10s máximo para conectar
  greetingTimeout: 10000,   // 10s máximo para handshake SMTP
  socketTimeout: 15000      // 15s máximo de inactividad de socket
});

// 2. Verificar la conexión con el servidor SMTP al arrancar
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error de autenticación SMTP con Gmail:", error.message || error);
  } else {
    console.log("✅ Servidor SMTP listo: Conexión con Gmail verificada.");
  }
});

// 3. ACTIVACIÓN (Cuenta nueva)
const enviarCorreoActivacion = async (emailDestino, nombre, token) => {
  try {
    const urlActivacion = `${FRONTEND_URL}/activar-cuenta?token=${token}`; 
    console.log("🔗 URL DE ACTIVACIÓN:", urlActivacion);

    const info = await transporter.sendMail({
      from: `"Sistema Escolar 🏫" <${process.env.MAIL_USER || process.env.EMAIL_USER || 'sistema.josefaortiz@gmail.com'}>`,
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
    console.log("✅ Correo de activación enviado a:", emailDestino, "| ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error enviando activación:", error.message || error);
    return false;
  }
};

// 4. RECUPERACIÓN (Olvido Password)
const enviarCorreoRecuperacion = async (emailDestino, nombre, token) => {
  try {
    const urlRecuperacion = `${FRONTEND_URL}/reset-password/${token}`; 
    console.log("🔗 URL DE RECUPERACIÓN:", urlRecuperacion);

    const info = await transporter.sendMail({
      from: `"Sistema Escolar 🏫" <${process.env.MAIL_USER || process.env.EMAIL_USER || 'sistema.josefaortiz@gmail.com'}>`,
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
    console.log("✅ Correo de recuperación enviado a:", emailDestino, "| ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error enviando recuperación:", error.message || error);
    return false;
  }
};

module.exports = { 
  transporter, 
  enviarCorreoActivacion,
  enviarCorreoRecuperacion 
};