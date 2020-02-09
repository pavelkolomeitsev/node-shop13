const express = require('express');

const router = express.Router();

const productController = require('../controllers/error');

router.use(productController.errorPage);

module.exports = router;