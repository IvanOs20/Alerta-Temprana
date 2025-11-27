const express = require('express');
const router = express.Router();
const docentes = require('../controllers/docenteController');

router.post('/', docentes.create);
router.get('/', docentes.findAll);
router.get('/:id', docentes.findOne);
router.put('/:id', docentes.update);
router.delete('/:id', docentes.delete);

module.exports = router;