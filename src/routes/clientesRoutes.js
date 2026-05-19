const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.post('/', clientesController.cadastrarCliente);
router.get('/tickets', clientesController.getTicketsPorEmail);

module.exports = router;