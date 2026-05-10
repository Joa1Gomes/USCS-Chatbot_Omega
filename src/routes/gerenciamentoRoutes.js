const express = require('express');
const router = express.Router();
const gerenciamentoController = require('../controllers/gerenciamentoController');

router.get('/lojas-empresa', gerenciamentoController.listarLojasEmpresa);
router.get('/:id/lojas', gerenciamentoController.listarLojasUsuario);
router.put('/:id/lojas', gerenciamentoController.atualizarLojasUsuario);

router.get('/', gerenciamentoController.listarUsuarios);
router.put('/:id', gerenciamentoController.atualizaPermissao);
router.delete('/:id', gerenciamentoController.deletarUsuario);



module.exports = router;


