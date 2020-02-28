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

// 'Product' - in the name of schema and productSchema - is an instance of Schema named 'Product'
module.exports = mongoose.model('Product', productSchema);