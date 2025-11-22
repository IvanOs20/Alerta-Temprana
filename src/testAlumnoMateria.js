const { sequelize, tb_alumno_materia, tb_alumnos, tb_materias } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado correctamente.\n');


    // Verificar que existan registros base
    const alumno = await tb_alumnos.findOne();
    const materia = await tb_materias.findOne();

    if (!alumno || !materia) {
      console.log('⚠️ Debes tener al menos un alumno y una materia en la BD.');
      return;
    }

    // Crear relación alumno-materia
    const relacion = await tb_alumno_materia.create({
      id_alumno: alumno.id_alumno,
      id_materia: materia.id_materia,
      calificacion: 9.25,
    });

    console.log('🆕 Relación creada:', relacion.toJSON());

    // Mostrar todas las relaciones existentes
    const relaciones = await tb_alumno_materia.findAll({
      include: [
        { model: tb_alumnos, attributes: ['nombre', 'apellidos'] },
        { model: tb_materias, attributes: ['nombre_materia'] },
      ],
    });

    console.log('\n📋 Lista de calificaciones:');
    relaciones.forEach(r => {
      console.log({
        alumno: `${r.tb_alumno?.nombre} ${r.tb_alumno?.apellidos}`,
        materia: r.tb_materia?.nombre_materia,
        calificacion: r.calificacion,
      });
    });

  } catch (error) {
    console.error('❌ Error al probar el modelo:', error);
  } finally {
    await sequelize.close();
  }
})();
