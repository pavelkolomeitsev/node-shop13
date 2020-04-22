const mongodb = require('mongodb');

const getDB = require('../util/database').getDB;

class User {
    constructor(userName, email, cart, id) {
        this.name = userName;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDB();

        return db.collection('users').insertOne(this);
    }

    addToCart(product) {
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
            updatedCartItems.push({ productId: new mongodb.ObjectId(product._id), quantity: newQuantity });
        }

        // { ...product, quantity: 1} - object which has two properties:
        // 1 - an id of product, 2 - quantity of products
        const updatedCart = { items: updatedCartItems };
        const db = getDB();
        return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: updatedCart } });
    }

    getCart() {
        const db = getDB();
        // take a cart and return all productIds of products in the cart
        const productIds = this.cart.items.map(item => {
            return item.productId;
        });
        // return all products which mentioned in the cart
        // we pass an array of ids for checking
        return db.collection('products').find({ _id: { $in: productIds } }).toArray()
            .then(products => {
                return products.map(product => {
                    // for quantity: at first find product in the cart
                    // after that get its quantity
                    return {
                        ...product, quantity: this.cart.items.find(item => {
                            return item.productId.toString() === product._id.toString();
                        }).quantity
                    };
                });
            });
    }

    deleteProductFromCart(productId) {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });

        const db = getDB();

        return db.collection('users')
            .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: updatedCartItems } } });
    }

    addOrder() {
        const db = getDB();
        // get user`s products from the cart
        return this.getCart().then(products => {
            // create an order object which has user`s id and products in the cart
            const order = {
                items: products,
                user: {
                    _id: new mongodb.ObjectId(this._id),
                    name: this.name,
                }
            };
            // insert an order-item into the collection
            return db.collection('orders').insertOne(order);
        })
            .then(result => {
                this.cart = { items: [] }; // in the user`s cart make an array of items empty
                // update property cart in the user-object
                return db.collection('users')
                    .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } });
            });

    }

    getOrders() {
        const db = getDB();

        return db.collection('orders').find({ 'user._id': new mongodb.ObjectId(this._id) }).toArray();
    }

    static findById(userId) {
        const db = getDB();
        return db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) });
    }
}
module.exports = User;