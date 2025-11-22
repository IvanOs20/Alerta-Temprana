// src/testAlumnos.js
const { sequelize, tb_alumnos, tb_grupos, tb_tutores } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado correctamente.\n');

    // Verificar que haya un grupo
    const grupos = await tb_grupos.findAll({ limit: 1 });
    if (grupos.length === 0) {
      console.log('⚠️ No hay grupos disponibles. Inserta uno antes de probar los alumnos.');
      return;
    }
    const grupo = grupos[0];

    // Verificar que haya un tutor
    const tutores = await tb_tutores.findAll({ limit: 1 });
    if (tutores.length === 0) {
      console.log('No hay tutores disponibles. Inserta uno antes de probar los alumnos.');
      return;
    }
    const tutor = tutores[0];

    // Crear un alumno de prueba
    const nuevoAlumno = await tb_alumnos.create({
      nombre: 'AXELITOO',
      apellidos: 'GARGAMO',
      id_grupo: grupo.id_grupo,
      id_tutor: tutor.id_tutor
    });

    console.log('Alumno creado:', nuevoAlumno.toJSON());

    // Listar todos los alumnos con información de grupo y tutor
    const alumnos = await tb_alumnos.findAll({
      include: [
        { model: tb_grupos, attributes: ['grado', 'grupo'] },
        { model: tb_tutores, attributes: ['nombre', 'apellidos'] }
      ]
    });

    console.log('\nLista de alumnos:');
    alumnos.forEach(a => {
      console.log({
        id_alumno: a.id_alumno,
        nombre: a.nombre,
        apellidos: a.apellidos,
        grupo: `${a.tb_grupo.grado}${a.tb_grupo.grupo}`,
        tutor: `${a.tb_tutore.nombre} ${a.tb_tutore.apellidos}`
      });
    });

  } catch (error) {
    console.error('Error al probar el modelo:', error);
  } finally {
    await sequelize.close();
  }
})();
