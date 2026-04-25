const express = require('express');
const router = express.Router();
const chamadoController = require('../controllers/chamadoController');

router.get('/', chamadoController.getChamados);
router.patch('/:id', chamadoController.updateChamado);
router.patch('/:id/fechar', chamadoController.fecharChamado);

module.exports = router;