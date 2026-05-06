const express = require('express');
const router = express.Router();
const gerenciamentoLojasControler = require('../controllers/gerenciamentoLojasController');

router.get('/lista', gerenciamentoLojasControler.getLojas);
router.post('/cadastraLoja', gerenciamentoLojasControler.cadastraLojas);
router.patch('/editarLoja/:id_loja', gerenciamentoLojasControler.editarLoja);
router.delete('/deletarLoja/:id_loja', gerenciamentoLojasControler.deletaLoja);

module.exports = router;