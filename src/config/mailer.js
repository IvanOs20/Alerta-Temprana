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
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 8px;">Bienvenido ${nombre}</h2>
          <p style="font-size: 15px; line-height: 1.5; color: #475569; margin-bottom: 24px;">
            Se ha creado tu cuenta en el sistema escolar <strong>sigeJOD</strong>. Haz clic en el botón inferior para definir tu contraseña y activarla:
          </p>
          
          <div style="margin: 28px 0; text-align: center;">
            <a href="${urlActivacion}" 
               target="_blank" 
               rel="noopener noreferrer" 
               style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
              Activar Cuenta
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          
          <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">
            Si el botón no responde, haz clic directamente en el siguiente enlace:
          </p>
          <p style="background-color: #f8fafc; padding: 12px; border-radius: 6px; margin: 0; word-break: break-all;">
            <a href="${urlActivacion}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-size: 13px;">
              ${urlActivacion}
            </a>
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
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #d9534f; margin-top: 0; margin-bottom: 8px;">Recuperación de Acceso</h2>
          <p style="font-size: 15px; line-height: 1.5; color: #475569; margin-bottom: 24px;">
            Hola ${nombre}, recibimos una solicitud para restablecer la contraseña de tu cuenta.
          </p>
          
          <div style="margin: 28px 0; text-align: center;">
            <a href="${urlRecuperacion}" 
               target="_blank" 
               rel="noopener noreferrer" 
               style="background-color: #007bff; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          
          <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">
            Si el botón no responde, haz clic directamente en el siguiente enlace:
          </p>
          <p style="background-color: #f8fafc; padding: 12px; border-radius: 6px; margin: 0; word-break: break-all;">
            <a href="${urlRecuperacion}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline; font-size: 13px;">
              ${urlRecuperacion}
            </a>
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