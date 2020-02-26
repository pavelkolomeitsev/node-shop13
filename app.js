const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // it`s a path-builder to the directory or file
const mongoose = require('mongoose');

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
    User.findById('5e56365cdc10d110781a2194')
        .then(user => {
            // to have an access to all functionality of User-object we have to create a new one
            req.user = user;
            next(); // call next() the request will reach a route handler
        })
        .catch(error => console.log(error));
});

// register our routes in app.js
// it`s a good practice to put them in proper order
app.use('/admin', adminRoutes); // filtering routes
app.use(shopRoutes);
app.use(errorRoutes);

// connect to MongoDb database with mongoose
mongoose
    .connect('mongodb+srv://pavel:yX3dbGT5P@clusternodeshop-frwbo.mongodb.net/shop?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Pavel',
                    email: 'test@test.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(9000);
    })
    .catch(error => console.log(error));