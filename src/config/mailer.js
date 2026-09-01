const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// 🌐 Base URL dinámica: Usa CLIENT_URL en producción o localhost en desarrollo
const FRONTEND_URL = process.env.CLIENT_URL || "https://sigejod.com";

// 1. ACTIVACIÓN (Cuenta nueva)
const enviarCorreoActivacion = async (emailDestino, nombre, token) => {
  try {
    const urlActivacion = `${FRONTEND_URL}/activar-cuenta?token=${token}`; 
    console.log("🔗 URL DE ACTIVACIÓN:", urlActivacion);

    const { data, error } = await resend.emails.send({
      from: "Sistema Escolar sigeJOD <notificaciones@sigejod.com>",
      to: [emailDestino],
      subject: "Active su cuenta - Sistema Escolar",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3>Bienvenido ${nombre}</h3>
          <p>Haga clic en el botón de abajo para activar su cuenta:</p>
          <a href="${urlActivacion}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Activar Cuenta</a>
          <br><br>
          <p style="color: #666; font-size: 14px;">Si el botón no funciona, copia y pega este enlace completo en tu navegador:</p>
          <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all;">
            <strong>${urlActivacion}</strong>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Error de Resend en activación:", error.message);
      return false;
    }

    console.log("✅ Correo de activación enviado a:", emailDestino, "| ID:", data?.id);
    return true;
  } catch (error) {
    console.error("❌ Error enviando activación:", error.message || error);
    return false;
  }
};

// 2. RECUPERACIÓN (Olvido Password)
const enviarCorreoRecuperacion = async (emailDestino, nombre, token) => {
  try {
    const urlRecuperacion = `${FRONTEND_URL}/reset-password/${token}`; 
    console.log("🔗 URL DE RECUPERACIÓN:", urlRecuperacion);

    const { data, error } = await resend.emails.send({
      from: "Sistema Escolar sigeJOD <notificaciones@sigejod.com>",
      to: [emailDestino],
      subject: "Restablecer Contraseña 🔐",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3 style="color: #d9534f;">Recuperación de Acceso</h3>
          <p>Hola ${nombre}, solicitaste restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <a href="${urlRecuperacion}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a>
          <br><br>
          <p style="color: #666; font-size: 14px;">Si el botón no funciona, copia y pega este enlace completo en tu navegador:</p>
          <p style="background-color: #f4f4f4; padding: 10px; word-break: break-all;">
            <strong>${urlRecuperacion}</strong>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Error de Resend en recuperación:", error.message);
      return false;
    }

    console.log("✅ Correo de recuperación enviado a:", emailDestino, "| ID:", data?.id);
    return true;
  } catch (error) {
    console.error("❌ Error enviando recuperación:", error.message || error);
    return false;
  }
};

module.exports = { 
  enviarCorreoActivacion,
  enviarCorreoRecuperacion 
};