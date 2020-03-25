const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // it`s a path-builder to the directory or file
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://@clusternodeshop-frwbo.mongodb.net/shop?retryWrites=true&w=majority';

const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        callback(null, new Date().toISOString().split(':').join('-') + '-' + file.originalname);
    }
});

const filter = (req, file, callback) => {

    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        callback(null, true);
    } else {
        callback(null, false);
    }
};

// set templates manually
//app.set('view engine', 'pug');
app.set('view engine', 'ejs'); // what template
app.set('views', 'views'); // where it will be located

// export routes from admin.js
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorRoutes = require('./routes/404');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');

// middleware - промежуточная обработка запросов/ответов + переход к следующей промежуточной функции
// use() - we add a middleware function to handle responses/requests

app.get('/favicon.ico', (req, res) => res.status(204));

// body-parser call a middleware function with next-method
// but before this it will parse incoming request
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: filter }).single('image')); // image, because field-name form input 'image'
// how to connect css files with express.js
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    // we retrieve an exact user from database (table 'User')
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(error => {
            throw new Error(error);
        });
});


// register our routes in app.js
// it`s a good practice to put them in proper order
app.use('/admin', adminRoutes); // filtering routes
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.get500);
app.use(errorRoutes);

app.use((error, req, res, next) => {

    //res.redirect('/500');
    res.status(500).render('500', {
        pageTitle: 'Problems with server!',
        path: '/500', isAuthenticated: req.session.isLoggedIn
    });
});

// connect to MongoDb database with mongoose
mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {

        app.listen(9000);
    })
    .catch(error => console.log(error));
