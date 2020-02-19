const mongoDB = require('mongodb');

const getDB = require('../util/database').getDB;

class Product {
    constructor(title, price, imageUrl, description, id) {
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this._id = id ? new mongoDB.ObjectId(id) : null;
    }

    save() {
        const db = getDB();
        let dbOptinal;
        if (this._id) {
            dbOptinal = db.collection('products').updateOne({ _id: this._id }, { $set: this });
        } else {
            dbOptinal = db.collection('products').insertOne(this);
        }
        return dbOptinal;
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

    static deleteById(productId) {
        const db = getDB();
        return db.collection('products').deleteOne({ _id: new mongoDB.ObjectId(productId) });
    }
}

module.exports = Product;