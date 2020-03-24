const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {

    const page = +req.query.page || 1;
    let totalItems;

    Product.find().countDocuments()
        .then(amountProducts => {

            totalItems = amountProducts;

            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE) // pagination technic -> 2 products per page
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            // we pass 'products' as a map item
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All products',
                path: '/products',
                currentPage: page,
                totalProducts: totalItems,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getProduct = (req, res, next) => {
    // :productId in routes/shop.js and req.params.productId HAVE TO MATCH
    const prodId = req.params.productId;

    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products',
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getIndex = (req, res, next) => {

    const page = +req.query.page || 1;
    let totalItems;

    Product.find().countDocuments()
        .then(amountProducts => {

            totalItems = amountProducts;

            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE) // pagination technic -> 2 products per page
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'All products',
                path: '/products',
                currentPage: page,
                totalProducts: totalItems,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
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
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: user.cart.items,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteProductFromCart(prodId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
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
                    email: req.user.email,
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getOrders = (req, res, next) => {

    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('No order found'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }

            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('invoices', invoiceName);

            const pdfDoc = new PDFDocument();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('Invoice');
            pdfDoc.fontSize(20).text('Date: ' + order.date.toDateString());
            pdfDoc.text('---------------------');
            order.products.forEach(item => {
                pdfDoc.text(item.productData.title + ' - ' + item.quantity + ' * ' + item.productData.price + '$');
            });
            pdfDoc.text('---------------------');
            pdfDoc.fontSize(26).text('Total price: ' + order.totalPrice + '$');

            pdfDoc.end();
        })
        .catch(error => next(error));
}