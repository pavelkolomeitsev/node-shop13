const mongodb = require('mongodb');

const getDB = require('../util/database').getDB;

class User {
    constructor(userName, email, id) {
        this.userName = userName;
        this.email = email;
    }

    save() {
        const db = getDB();

        return db.collection('users').insertOne(this);
    }

    static findById(userId) {
        const db = getDB();
        return db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) });
    }
}
module.exports = User;