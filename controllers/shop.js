const Product = require('../models/product');
const Order = require('../models/order');

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

    req.user
        .populate('cart.items.productId') // populate cart-property with not just ids of products but all products
        .execPopulate()
        .then(user => {

            // products = user.cart.items;
            res.render('shop/cart', { pageTitle: 'Your Cart', path: '/cart', products: user.cart.items });
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

    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {

            const products = user.cart.items.map(item => {
                // return a new object
                return { quantity: item.quantity, productData: { ...item.productId._doc } };
            });

            let totalPrice = 0;

            products.forEach(product => {
                totalPrice += product.productData.price * product.quantity;
            });

            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user._id
                },
                products: products,
                totalPrice: totalPrice.toFixed(2) // round up total price
            });

            // clear the cart
            user.cart.items = [];
            user.save();

            return order.save();
        })
        .then(() => {

            res.redirect('/orders');
        })
        .catch(error => console.log(error));
}

exports.getOrders = (req, res, next) => {

    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', { pageTitle: 'Your Orders', path: '/orders', orders: orders });
        })
        .catch(error => console.log(error));
}