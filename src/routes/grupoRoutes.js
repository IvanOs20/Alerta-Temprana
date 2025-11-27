const express = require('express');
const router = express.Router();
const grupos = require('../controllers/grupoController');

router.post('/', grupos.create);
router.get('/', grupos.findAll);
router.get('/:id', grupos.findOne);
router.put('/:id', grupos.update);
router.delete('/:id', grupos.delete);

module.exports = router;