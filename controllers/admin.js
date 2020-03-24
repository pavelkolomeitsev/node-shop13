const mongoose = require('mongoose');
const fileHelper = require('../util/file');
const { validationResult } = require('express-validator');

const Product = require('../models/product');

// we export our function for using in admin.js-file
exports.getAddProduct = (req, res, next) => {
    // in html-form two important things action="/product" - path, method="POST"
    // should match with router command (post/get/put/delete)
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            path: '/admin/add-product',
            pageTitle: 'Add Product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: 'Attached file is not an image',
            validationErrors: []
        });
    }

    const errors = validationResult(req); // validationResult will handle all errors the user makes during input

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            path: '/admin/add-product',
            pageTitle: 'Add Product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const imageUrl = image.path;

    const product = new Product({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        userId: req.user._id
    });

    product
        .save()
        .then((result) => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getEditProduct = (req, res, next) => {
    // req.query.edit - has to match with 'edit-product/...?edit=true'
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }

    // req.params.productId - has to match with 'edit-product/0.958517266103522...'
    const prodId = req.params.productId;
    //req.user.getProducts({ where: { id: prodId } })
    Product.findById(prodId)
        .then(product => {
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postEditProduct = (req, res, next) => {
    // 1 - fetch data from edit-product page
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDescription = req.body.description;

    const errors = validationResult(req); // validationResult will handle all errors the user makes during input

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            path: '/admin/edit-product',
            pageTitle: 'Edit Product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
                _id: prodId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            product.description = updatedDescription;
            return product.save()
                .then(() => { res.redirect('/admin/products') });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

    // Product.findByIdAndUpdate(prodId, // id of product
    //     { $set: { title: updatedTitle, price: updatedPrice, imageUrl: updatedImageUrl, description: updatedDescription } }, // updated properties of object
    //     { runValidators: true }) // turn on Mongoose`s validators, because Mongoose does not run validation during querying
    //     .then(() => { res.redirect('/admin/products') })
    //     .catch(error => console.log(error));
}

exports.getProducts = (req, res, next) => {

    Product.find({ userId: req.user._id })
        // .select('title price imageUrl -_id')
        // .populate({ path: 'userId', select: '-_id name email' })
        .then(products => {

            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;

    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return next(new Error('Product not found'));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: prodId, userId: req.user._id });
        })
        .then(() => {
            res.status(200).json({ message: 'Success!' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Deleting product failed!' });
        });
}