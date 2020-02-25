const express = require('express');

const router = express.Router();

const shopController = require('../controllers/shop');

// besides making a GET-request, get-method also does EXACT matching of the route '/'!!!
// that`s why the order of routes in app.js file doesn`t matter
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

// extracting an id (:productId) from href-attribute
router.get('/products/:productId', shopController.getProduct);

// router.get('/cart', shopController.getCart);

// router.post('/cart', shopController.postCart);

// router.post('/cart-delete-item', shopController.postCartDeleteProduct);

// router.post('/create-order', shopController.postOrder);

// router.get('/orders', shopController.getOrders);

module.exports = router;