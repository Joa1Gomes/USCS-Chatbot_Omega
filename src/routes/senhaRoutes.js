const express = require('express');
const router = express.router();
const senhaController = require('../controllers/senhaController');

router.post('/esqueceu', senhaController.solicitarReset);
router.post('/resetar', senhaController.resetarSenha);

module.exports = router;