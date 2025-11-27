const express = require('express');
const router = express.Router();
const materias = require('../controllers/materiaController');

router.post('/', materias.create);
router.get('/', materias.findAll);
router.get('/:id', materias.findOne);
router.put('/:id', materias.update);
router.delete('/:id', materias.delete);

module.exports = router;