const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let db;

// connect to MongoDB database
const mongoConnection = (callback) => {
    MongoClient.connect('mongodb+srv://pavel:yX3dbGT5P@clusternodeshop-frwbo.mongodb.net/test?retryWrites=true&w=majority')
        .then(client => {
            console.log('Connected!');
            db = client.db();
            callback();
        })
        .catch(error => {
            console.log(error);
            throw error;
        });
}

const getDB = () => {
    if (db) {
        return db;
    }

    throw 'No database found!';
}

exports.mongoConnection = mongoConnection;
exports.getDB = getDB;