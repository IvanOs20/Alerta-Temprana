// src/testTutores.js
const { sequelize, tb_tutores } = require('../../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado correctamente.\n');

    // Crear un tutor de prueba
    const nuevoTutor = await tb_tutores.create({
      nombre: 'Axel',
      apellidos: 'Diaz',
      telefono: '552721234567'
    });

    console.log('Tutor creado:', nuevoTutor.toJSON());

    // Mostrar todos los tutores existentes
    const tutores = await tb_tutores.findAll();
    console.log('\n📋 Lista de tutores:');
    console.log(tutores.map(t => t.toJSON()));

  } catch (error) {
    console.error('Error al probar el modelo:', error);
  } finally {
    await sequelize.close();
  }
})();
