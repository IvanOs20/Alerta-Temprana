const db = require('../models'); // Importa todos los modelos y sequelize

(async () => {
  try {
    // Probar conexión
    await db.sequelize.authenticate();
    console.log("Conexión establecida correctamente.\n");

    console.log("Modelos cargados:");
    console.log(Object.keys(db)); // Lista todos los modelos cargados

    // Probar cada modelo
    for (const modelName of Object.keys(db)) {
      if (modelName === "sequelize" || modelName === "Sequelize") continue;

      const model = db[modelName];
      console.log(`Probando modelo: ${modelName}`);

      // Verificar que tenga atributos
      console.log("Atributos:", Object.keys(model.rawAttributes));
    }

  } catch (error) {
    console.error("Error al probar el modelo:", error);
  } finally {
    await db.sequelize.close();
  }
})();
