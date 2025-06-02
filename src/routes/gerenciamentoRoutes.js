const express = require('express');
const router = express.Router();
const gerenciamentoController = require('../controllers/gerenciamentoController');

router.get('/', gerenciamentoController.listarUsuarios);
router.put('/:id', gerenciamentoController.atualizaPermissao);
router.delete('/:id', gerenciamentoController.deletarUsuario);

module.exports = router;