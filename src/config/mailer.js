const nodemailer = require("nodemailer");

// 1. Configuración del transporte (Optimizado para Render/Nube)
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // Debería ser 'smtp.gmail.com'
    port: 587, // <--- CAMBIADO: Usar el puerto 587 (TLS)
    secure: false, // <--- CAMBIADO: Desactivar 'secure' para usar STARTTLS
    auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS, // Contraseña de Aplicación de 16 caracteres
    },
    // CRÍTICO: Forzar la seguridad TLS para evitar el ETIMEDOUT en la nube
    tls: {
        rejectUnauthorized: false
    }
});

// 2. Función para enviar el correo de activación
const enviarCorreoActivacion = async (emailDestino, nombre, token) => {
    try {
        // CORRECCIÓN: Usar la variable de entorno del Frontend (que ahora debe ser la URL de Render)
        // Ejemplo: https://mi-frontend-app.onrender.com/activar-cuenta?token=...
        const urlBaseFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
        const urlActivacion = `${urlBaseFrontend}/activar-cuenta?token=${token}`;

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
        // Si hay error, regresamos false para que el controlador pueda manejarlo (ej. borrar usuario)
        return false; 
    }
};

module.exports = { transporter, enviarCorreoActivacion };