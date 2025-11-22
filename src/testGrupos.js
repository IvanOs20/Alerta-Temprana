// src/testGrupos.js
const { sequelize, tb_grupos, tb_docentes } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado correctamente.\n');

    // Verificamos que existan docentes
    const docentes = await tb_docentes.findAll({ limit: 1 });
    if (docentes.length === 0) {
      console.log('No hay docentes disponibles. Inserta uno antes de probar los grupos.');
      return;
    }

    const docente = docentes[0];

    // Crear un grupo nuevo (ajustando los campos reales)
    const nuevoGrupo = await tb_grupos.create({
      grado: '6',        // ← valor de ejemplo
      grupo: 'A',        // ← valor de ejemplo
      id_docente: docente.id_docente
    });

    console.log('Grupo creado:', nuevoGrupo.toJSON());

    // Mostrar todos los grupos existentes (con el nombre del docente)
    const grupos = await tb_grupos.findAll({
      include: {
        model: tb_docentes,
        attributes: ['nombre', 'apellidos']
      }
    });

    console.log('\nLista de grupos:');
    grupos.forEach(g => {
      console.log({
        id_grupo: g.id_grupo,
        grado: g.grado,
        grupo: g.grupo,
        docente: `${g.tb_docente.nombre} ${g.tb_docente.apellidos}`
      });
    });

  } catch (error) {
    console.error('Error al probar el modelo:', error);
  } finally {
    await sequelize.close();
  }
})();

