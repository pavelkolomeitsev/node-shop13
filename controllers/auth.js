const bcrypt = require('bcryptjs');

const User = require('../models/user');

// we just redirect the user to login-page
exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    // in html-form two important things action="/product" - path, method="POST"
    // should match with router command (post/get/put/delete)
    res.render('auth/login', { pageTitle: 'Login', path: '/login', errorMessage: message });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email }) // find the user in the database by email
        .then(user => {
            if (!user) { // if we don`t find -> redirect
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password) // otherwise decrypt and compare passwords
                .then(doMatch => { // get a result
                    if (doMatch) { // if it matches -> create a session
                        req.session.isLoggedIn = true;
                        req.session.user = user; // assign to it a user-object
                        // save a session in the database and redirect to the main page
                        return req.session.save((error) => {
                            console.log(error);
                            res.redirect('/');
                        });
                    }
                    req.flash('error', 'Invalid email or password');
                    res.redirect('/login'); // otherwise -> try again
                })
                .catch(error => {
                    console.log(error);
                    res.redirect('/login');
                });
        })
        .catch(error => console.log(error));
};

exports.postSignup = (req, res, next) => {
    // read fields from signup page
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    // check by email if we have the same user
    User.findOne({ email: email })
        .then(userDoc => {
            // if it`s true -> try again
            if (userDoc) {
                req.flash('error', 'Email exists already');
                return res.redirect('/signup');
            }

            // otherwise at first encrypt a password
            return bcrypt.hash(password, 12)
                // then save a new user with encrypted password in our database
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });
                    return user.save();
                })
                // after that redirect a user to login page
                .then(result => {
                    res.redirect('/login');
                });
        })
        .catch(error => {
            console.log(error);
        });
};

exports.postLogout = (req, res, next) => {

    req.session.destroy((error) => {
        console.log(error);
        res.redirect('/');
    });
};