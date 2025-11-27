const express = require('express');
const router = express.Router();
const tutores = require('../controllers/tutorController');

router.post('/', tutores.create);
router.get('/', tutores.findAll);
router.get('/:id', tutores.findOne);
router.put('/:id', tutores.update);
router.delete('/:id', tutores.delete);

module.exports = router;