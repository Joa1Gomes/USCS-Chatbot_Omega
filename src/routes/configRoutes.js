const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/:id/info', configController.getUserInfo);
router.put('/:id/nome', configController.updateNome);
router.put('/:id/email', configController.updateEmail);
router.put('/:id/senha', configController.updateSenha);

module.exports = router;
