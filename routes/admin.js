const express = require('express');

//const rootDir = require('../util/path'); // it`s the place where our app begin to start
const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

// 1 - the user on the page '/add-product' makes GET-request
// 2 - the server (express.js) responds to him a submit form for ask him input some text
// and after that redirect the user (when he click submit button) to the page '/product'
// 3 - on the page '/product' the server gets data which the user inputed, parses it and display in the console
// 4 - after that in the POST-command the server redirect the user to the page '/'

// /admin/add-product => GET, request read params from left to right
// and will execute middleware functions
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// we can filter post and get requests with the help of get and post commands
// TWO IMPORTANT THINGS post/get/put/delete commands and PATH ('/product')
// /admin/add-product => POST
router.post('/add-product', isAuth, adminController.postAddProduct); // property-function of productsController-object

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;