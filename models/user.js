const mongoose = require('mongoose');

const Product = require('./product');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true }
            }
        ]
    }
});

// by helping 'methods'-option we can implement our own methods in User-Schema
userSchema.methods.addToCart = function (product) {
    // check if existing product is in the cart
    const cartProductIndex = this.cart.items.findIndex(item => {
        return item.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    // increase product`s quantity in the cart
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({ productId: product._id, quantity: newQuantity });
    }

    // { ...product, quantity: 1} - object which has two properties:
    // 1 - an id of product, 2 - quantity of products
    const updatedCart = { items: updatedCartItems };

    this.cart = updatedCart;
    return this.save();
}


//     deleteProductFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         });

//         const db = getDB();

//         return db.collection('users')
//             .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: updatedCartItems } } });
//     }

//     addOrder() {
//         const db = getDB();
//         // get user`s products from the cart
//         return this.getCart().then(products => {
//             // create an order object which has user`s id and products in the cart
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new mongodb.ObjectId(this._id),
//                     name: this.name,
//                 }
//             };
//             // insert an order-item into the collection
//             return db.collection('orders').insertOne(order);
//         })
//             .then(result => {
//                 this.cart = { items: [] }; // in the user`s cart make an array of items empty
//                 // update property cart in the user-object
//                 return db.collection('users')
//                     .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } });
//             });

//     }

//     getOrders() {
//         const db = getDB();

//         return db.collection('orders').find({ 'user._id': new mongodb.ObjectId(this._id) }).toArray();
//     }

//     static findById(userId) {
//         const db = getDB();
//         return db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) });
//     }
// }
module.exports = mongoose.model('User', userSchema);