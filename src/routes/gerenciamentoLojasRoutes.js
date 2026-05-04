const express = require('express');
const router = express.Router();
const gerenciamentoLojasControler = require('../controllers/gerenciamentoLojasController');

router.get('/lista', gerenciamentoLojasControler.getLojas);

module.exports = router;