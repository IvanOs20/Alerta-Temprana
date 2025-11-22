// src/testModels.js
const { sequelize, tb_docentes } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado correctamente.\n');

    // Crear un nuevo docente de prueba
    const nuevoDocente = await tb_docentes.create({
      nombre: 'Tonyy',
      apellidos: 'Sanchez'
    });

    console.log('Docente creado:', nuevoDocente.toJSON());

    // Mostrar todos los docentes existentes
    const docentes = await tb_docentes.findAll();
    console.log('\nLista actual de docentes:');
    console.log(docentes.map(d => d.toJSON()));

  } catch (error) {
    console.error('Error al probar el modelo:', error);
  } finally {
    await sequelize.close();
  }
})();

