const express = require('express');

const router = express.Router();

const shopController = require('../controllers/shop');

const isAuth = require('../middleware/is-auth');

// besides making a GET-request, get-method also does EXACT matching of the route '/'!!!
// that`s why the order of routes in app.js file doesn`t matter
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

// extracting an id (:productId) from href-attribute
router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;