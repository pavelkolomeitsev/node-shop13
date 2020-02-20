const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // it`s a path-builder to the directory or file

const mongoConnection = require('./util/database').mongoConnection;
const User = require('./models/user');

const app = express();

// set templates manually
//app.set('view engine', 'pug');
app.set('view engine', 'ejs'); // what template
app.set('views', 'views'); // where it will be located

// export routes from admin.js
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorRoutes = require('./routes/404');

// middleware - промежуточная обработка запросов/ответов + переход к следующей промежуточной функции
// use() - we add a middleware function to handle responses/requests

app.get('/favicon.ico', (req, res) => res.status(204));

// body-parser call a middleware function with next-method
// but before this it will parse incoming request
app.use(bodyParser.urlencoded({ extended: false }));
// how to connect css files with express.js
app.use(express.static(path.join(__dirname, 'public')));

// register this function, it will execute only on incoming request
app.use((req, res, next) => {
    // we retrieve an exact user from database (table 'User')
    User.findById('5e4e4a6d135dc3136834ef77')
        .then(user => {
            req.user = user; // and add a new field (sequelize object) to the request object - (GET)
            next(); // call next() the request will reach a route handler
        })
        .catch(error => console.log(error));
});

// register our routes in app.js
// it`s a good practice to put them in proper order
app.use('/admin', adminRoutes); // filtering routes
app.use(shopRoutes);
app.use(errorRoutes);

mongoConnection(() => {

    app.listen(9000);
});