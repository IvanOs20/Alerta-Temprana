const { sequelize, tb_notificaciones, tb_docentes, tb_alumnos } = require('../../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado correctamente.\n');

    // Buscar un docente y un alumno existentes
    const docente = await tb_docentes.findOne();
    const alumno = await tb_alumnos.findOne();

    if (!docente || !alumno) {
      console.log('⚠️ No hay docentes o alumnos registrados. Agrega datos primero.');
      return;
    }

    // Crear una nueva notificación
    const nuevaNotificacion = await tb_notificaciones.create({
      id_docente: docente.id_docente,
      id_alumno: alumno.id_alumno,
      mensaje: 'Revisión de tareas el viernes a las 10:00 AM.',
      fecha_envio: new Date().toISOString().split('T')[0],
      hora_envio: new Date().toTimeString().split(' ')[0]
    });

    console.log('📨 Notificación creada:', nuevaNotificacion.toJSON());

    // Listar todas las notificaciones con los nombres de docente y alumno
    const notificaciones = await tb_notificaciones.findAll({
      include: [
        { model: tb_docentes, attributes: ['nombre', 'apellidos'] },
        { model: tb_alumnos, attributes: ['nombre', 'apellidos'] }
      ]
    });

    console.log('\n📋 Lista de notificaciones:');
    notificaciones.forEach(n => {
      console.log(`De ${n.tb_docente.nombre} ${n.tb_docente.apellidos} → ${n.tb_alumno.nombre} ${n.tb_alumno.apellidos}`);
      console.log(`Mensaje: ${n.mensaje}`);
      console.log(`Fecha: ${n.fecha_envio} | Hora: ${n.hora_envio}`);
      console.log('----------------------------');
    });

  } catch (error) {
    console.error('❌ Error al probar el modelo:', error);
  } finally {
    await sequelize.close();
  }
})();
