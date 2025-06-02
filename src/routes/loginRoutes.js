const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('mssql');
const loginController = require('../controllers/loginController');
const config = require('../../dbConfig').default;

router.post('/', loginController.LogarUsuario);

module.exports = router;
      