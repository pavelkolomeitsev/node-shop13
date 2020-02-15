const Product = require('../models/product');

exports.getProducts = (req, res, next) => {

    Product.findAll()
        .then(products => {
            // we pass 'products' as a map item
            res.render('shop/product-list', { prods: products, pageTitle: 'All products', path: '/products' });
        })
        .catch(error => console.log(error));
}

exports.getProduct = (req, res, next) => {
    // :productId in routes/shop.js and req.params.productId HAVE TO MATCH
    const prodId = req.params.productId;

    Product.findByPk(prodId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product, pageTitle: product.title, path: '/products'
            });
        })
        .catch(error => console.log(error));
}

exports.getIndex = (req, res, next) => {

    Product.findAll()
        .then(products => {
            // we pass 'products' as a map item
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
        .then(cart => {
            return cart.getProducts();
        })
        .then(products => {
            res.render('shop/cart', { pageTitle: 'Your Cart', path: '/cart', products: products });
        })
        .catch(error => console.log(error));
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let newCart;
    let newQuantity = 1;
    req.user.getCart()
        .then(cart => {
            newCart = cart;
            return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
            let product;

            if (products.length > 0) {
                product = products[0];
            }

            if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity += oldQuantity;
                return product;
            }
            return Product.findByPk(prodId)
        })
        .then(product => {
            return newCart.addProduct(product, { through: { quantity: newQuantity } });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(error => console.log(error));
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(error => console.log(error));
}

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    return order.addProducts(products.map(product => {
                        product.orderItem = { quantity: product.cartItem.quantity };
                        return product;
                    }));
                })
                .catch(error => console.log(error));
        })
        .then(() => {
            return fetchedCart.setProducts(null);
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(error => console.log(error));
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders({ include: ['products'] })
        .then(orders => {
            res.render('shop/orders', { pageTitle: 'Your Orders', path: '/orders', orders: orders });
        })
        .catch(error => console.log(error));
}