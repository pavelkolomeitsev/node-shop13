const { Sequelize } = require('sequelize'); // import constructor function

// create a new sequelize instance
// where we have to pass - a name of database, username, password and an object
// it will automatically connect to database
const sequelize = new Sequelize('node_complete', 'root', '********', { dialect: 'mysql', host: 'localhost', logging: false });

// it`s a database connection pool which managed by Sequelize
module.exports = sequelize;
// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node_complete', // name of database is the same as we create a new schema 'node_complete' in MySQL Workbench
//     password: 'My12345SQL' // password we create during installation MySQL
// });

// module.exports = pool.promise();
