const express = require('express');
const router = express.Router();
const homePageController = require('../controllers/homePageController')

router.get('/cards', homePageController.getHomePageData);
router.get('/chamadosRecentes', homePageController.getHomePageRecentes)

module.exports = router;