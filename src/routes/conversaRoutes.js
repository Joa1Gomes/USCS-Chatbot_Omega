const express = require('express');
const router = express.Router();
const conversaController = require('../controllers/conversaController');

router.post('/', conversaController.criarConversa);
router.get('/ticket/:id_ticket', conversaController.getConversaPorTicket);
router.get('/:id/mensagens', conversaController.getMensagens);
router.post('/:id/mensagens', conversaController.inserirMensagem);

module.exports = router;
