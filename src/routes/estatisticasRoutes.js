const express = require('express');
const router = express.Router();
const estatisticasController = require('../controllers/estatisticasController');

router.get('/', estatisticasController.getEstatisticas);

module.exports = router;