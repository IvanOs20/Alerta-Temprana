// src/testMaterias.js
const { sequelize, tb_materias } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado correctamente.\n');

    // Crear una materia de prueba (usando el nombre de columna correcto)
    const nuevaMateria = await tb_materias.create({
      nombre_materia: 'Matemáticas'
    });

    console.log('📘 Materia creada:', nuevaMateria.toJSON());

    // Mostrar todas las materias existentes
    const materias = await tb_materias.findAll();
    console.log('\n📋 Lista de materias:');
    console.log(materias.map(m => m.toJSON()));

  } catch (error) {
    console.error('❌ Error al probar el modelo:', error);
  } finally {
    await sequelize.close();
  }
})();
