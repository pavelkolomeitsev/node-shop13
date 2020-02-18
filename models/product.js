const mongoDB = require('mongodb');

const getDB = require('../util/database').getDB;

class Product {
    constructor(title, price, imageUrl, description) {
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
    }

    save() {
        const db = getDB();
        return db.collection('products').insertOne(this)
            .then(result => {

            })
            .catch(error => console.log(error));
    }

    static fetchAll() {
        const db = getDB();
        return db.collection('products').find().toArray();
        // .then(products => {
        //     return products;
        // })
        // .catch(error => console.log(error));
    }

    static findById(productId) {
        const db = getDB();
        // _id is a BSON-object and productId is just a string
        // to solve this issue we create new ObjectId instance and pass productId as a param
        return db.collection('products').find({ _id: new mongoDB.ObjectId(productId) }).next();
    }
}

module.exports = Product;