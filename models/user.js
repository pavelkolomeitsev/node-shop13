// set a reference which gives us a Class function
const { Sequelize } = require('sequelize');

// connect our database
const sequelize = require('../util/database');

// define a User-model
// first arg - a name of model, second - define a structure of model
const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = User;