const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

<<<<<<< HEAD
// create a new sequelize instance
// where we have to pass - a name of database, username, password and an object
// it will automatically connect to database
const sequelize = new Sequelize('node_complete', 'root', '********', { dialect: 'mysql', host: 'localhost', logging: false });
=======
let db;
>>>>>>> mongodb

// connect to MongoDB database
const mongoConnection = (callback) => {
    // '...frwbo.mongodb.net/shop?retryWrites...' - 'shop' is the name of database
    MongoClient.connect('mongodb+srv://@clusternodeshop-frwbo.mongodb.net/shop?retryWrites=true&w=majority')
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

<<<<<<< HEAD
// module.exports = pool.promise();
=======
    throw 'No database found!';
}

exports.mongoConnection = mongoConnection;
exports.getDB = getDB;
>>>>>>> mongodb
