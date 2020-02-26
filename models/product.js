const mongoose = require('mongoose');

// get an access to Schema-constructor
const Schema = mongoose.Schema;

// this constructor allows us to crteate a new schema (таблица)
// in the constructor we define how our product should look like
const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // this prop points from which schema ObjectId mongoose has to take
        required: true
    }
});



// class Product {
//     constructor(title, price, imageUrl, description, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.imageUrl = imageUrl;
//         this.description = description;
//         this._id = id ? new mongoDB.ObjectId(id) : null;
//         this.userId = userId;
//     }

//     save() {
//         const db = getDB();
//         let dbOptinal;
//         if (this._id) {
//             dbOptinal = db.collection('products').updateOne({ _id: this._id }, { $set: this });
//         } else {
//             dbOptinal = db.collection('products').insertOne(this);
//         }

//         return dbOptinal;
//     }

//     static fetchAll() {
//         const db = getDB();
//         return db.collection('products').find().toArray();
//         // .then(products => {
//         //     return products;
//         // })
//         // .catch(error => console.log(error));
//     }

//     static findById(productId) {
//         const db = getDB();
//         // _id is a BSON-object and productId is just a string
//         // to solve this issue we create new ObjectId instance and pass productId as a param
//         return db.collection('products').find({ _id: new mongoDB.ObjectId(productId) }).next();
//     }

//     static deleteById(productId) {
//         const db = getDB();
//         return db.collection('products').deleteOne({ _id: new mongoDB.ObjectId(productId) });
//     }
// }

// 'Product' - in the name of schema and productSchema - is an instance of Schema named 'Product'
module.exports = mongoose.model('Product', productSchema);