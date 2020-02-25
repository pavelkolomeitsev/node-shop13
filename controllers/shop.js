const Product = require('../models/product');

exports.getProducts = (req, res, next) => {

    Product.find()
        .then(products => {
            // we pass 'products' as a map item
            res.render('shop/product-list', { prods: products, pageTitle: 'All products', path: '/products' });
        })
        .catch(error => console.log(error));
}

exports.getProduct = (req, res, next) => {
    // :productId in routes/shop.js and req.params.productId HAVE TO MATCH
    const prodId = req.params.productId;

    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product, pageTitle: product.title, path: '/products'
            });
        })
        .catch(error => console.log(error));
}

exports.getIndex = (req, res, next) => {

    Product.find()
        .then(products => {

            res.render('shop/product-list', { prods: products, pageTitle: 'All products', path: '/products' });
        })
        .catch(error => console.log(error));
    // Product.fetchAll()
    //     // destructuring - 'rows' stands as list of products (result[0]), 'fieldData' stands as result[1]
    //     .then(([rows, fieldData]) => {
    //         res.render('shop/index', { prods: rows, pageTitle: 'Shop', path: '/' });
    //     })
    //     .catch(error => console.log(error));
}

exports.getCart = (req, res, next) => {

    req.user.getCart()
        .then(products => {
            res.render('shop/cart', { pageTitle: 'Your Cart', path: '/cart', products: products });
        })
        .catch(error => console.log(error));
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(error => console.log(error));
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteProductFromCart(prodId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(error => console.log(error));
}

exports.postOrder = (req, res, next) => {
    req.user.addOrder()
        .then(() => {
            res.redirect('/orders');
        })
        .catch(error => console.log(error));
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders()
        .then(orders => {
            res.render('shop/orders', { pageTitle: 'Your Orders', path: '/orders', orders: orders });
        })
        .catch(error => console.log(error));
}