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
    // use magic association method of sequelize
    // as user one-to-many products, so we can create a separate product for user
    req.user
        .createProduct({
            title: title,
            imageUrl: imageUrl,
            price: price,
            description: description,
        })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(error => console.log(error));
}

// exports.getEditProduct = (req, res, next) => {
//     // req.query.edit - has to match with 'edit-product/...?edit=true'
//     const editMode = req.query.edit;
//     if (!editMode) {
//         return res.redirect('/');
//     }

//     // req.params.productId - has to match with 'edit-product/0.958517266103522...'
//     const prodId = req.params.productId;
//     req.user.getProducts({ where: { id: prodId } })
//         //Product.findByPk(prodId)
//         .then(products => {
//             const product = products[0];
//             res.render('admin/edit-product', {
//                 pageTitle: 'Edit Product',
//                 path: '/admin/edit-product',
//                 editing: editMode,
//                 product: product
//             });
//         })
//         .catch(error => console.log(error));
// }

// exports.postEditProduct = (req, res, next) => {
//     // 1 - fetch data from edit-product page
//     const prodId = req.body.productId;
//     const updatedTitle = req.body.title;
//     const updatedImageUrl = req.body.imageUrl;
//     const updatedPrice = req.body.price;
//     const updatedDescription = req.body.description;

//     Product.findByPk(prodId)
//         .then(product => {
//             product.title = updatedTitle;
//             product.imageUrl = updatedImageUrl;
//             product.price = updatedPrice;
//             product.description = updatedDescription;
//             return product.save();
//         })
//         .then(() => { res.redirect('/admin/products') })
//         .catch(error => console.log(error));

//     //res.redirect('/admin/products');
// }

// exports.getProducts = (req, res, next) => {

//     req.user.getProducts()
//         //Product.findAll()
//         .then(products => {
//             res.render('admin/products', { prods: products, pageTitle: 'Admin Products', path: '/admin/products' });
//         })
//         .catch(error => console.log(error));
//     // .then(([rows]) => {
//     //     res.render('admin/products', { prods: rows, pageTitle: 'Admin Products', path: '/admin/products' });
//     // })
//     // .catch(error => console.log(error));
// }

// exports.postDeleteProduct = (req, res, next) => {
//     const prodId = req.body.productId;

//     Product.destroy({ where: { id: prodId } })
//         .then(() => {
//             res.redirect('/admin/products');
//         })
//         .catch(error => console.log(error));
// }