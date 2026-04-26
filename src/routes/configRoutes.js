const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/:id/info', configController.getUserInfo);