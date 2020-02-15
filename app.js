const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // it`s a path-builder to the directory or file
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

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
    User.findByPk(1)
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

// set relations between tables - 'Product' and 'User' (one-to-many)
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

// call a special sync-method which look for all sequelize-define methods
// and syncs tables with sequelize models
sequelize.sync()
    //.sync({ force: true }) // set object { force: true } to rewrite and connect our tables together
    .then(result => {
        return User.findByPk(1); //set manually a dummy user
    })
    .then(user => {
        if (!user) {
            // create a user
            return User.create({ name: 'Pasha', email: 'test@test.com' });
        }
        // return Promise.resolve(user);
        return user;
    })
    .then(user => {

        // if we`ve got a new user, create a cart

        if (user.getCart()) {
            return;
        }

        return user.createCart();
    })
    .then(cart => {

        // it takes a server`s work to itself to listen to events
        // start our server only if we succesfully connect tables and models
        app.listen(9000);
    })
    .catch(error => console.log(error));