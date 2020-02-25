const Product = require('../models/product');

// we export our function for using in admin.js-file
exports.getAddProduct = (req, res, next) => {
    // in html-form two important things action="/product" - path, method="POST"
    // should match with router command (post/get/put/delete)
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
    res.render('admin/edit-product', { pageTitle: 'Add Product', path: '/admin/add-product', editing: false });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const product = new Product({ title: title, price: price, imageUrl: imageUrl, description: description });

    product
        .save()
        .then((result) => {

            res.redirect('/admin/products');
        })
        .catch(error => console.log(error));
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
                product: product
            });
        })
        .catch(error => console.log(error));
}

exports.postEditProduct = (req, res, next) => {
    // 1 - fetch data from edit-product page
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;

    Product.findByIdAndUpdate(prodId, // id of product
        { $set: { title: updatedTitle, price: updatedPrice, imageUrl: updatedImageUrl, description: updatedDescription } }, // updated properties of object
        { runValidators: true }) // turn on Mongoose`s validators, because Mongoose does not run validation during querying
        .then(() => { res.redirect('/admin/products') })
        .catch(error => console.log(error));
}

exports.getProducts = (req, res, next) => {

    Product.find()
        .then(products => {
            res.render('admin/products', { prods: products, pageTitle: 'Admin Products', path: '/admin/products' });
        })
        .catch(error => console.log(error));
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findByIdAndDelete(prodId)
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(error => console.log(error));
}