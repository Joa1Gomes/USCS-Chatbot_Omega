const express = require('express');
const router = express.Router();
const encerramentoController = require('../controllers/encerramentoController');

router.post('/', encerramentoController.encerrarAtendimento);

module.exports = router;