const express = require('express');
const router = express.Router();
const cadastroController = require('../controllers/cadastroController');

router.post('/', cadastroController.cadastrarUsuario);

module.exports = router;