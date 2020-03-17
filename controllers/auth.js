const User = require('../models/user');

// we just redirect the user to login-page
exports.getLogin = (req, res, next) => {
    // in html-form two important things action="/product" - path, method="POST"
    // should match with router command (post/get/put/delete)
    res.render('auth/login', { pageTitle: 'Login', path: '/login', isAuthenticated: false });
}

exports.postLogin = (req, res, next) => {

    User.findById('5e56365cdc10d110781a2194')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save((error) => {
                console.log(error);
                res.redirect('/');
            });
        })
        .catch(error => console.log(error));
}

exports.postLogout = (req, res, next) => {

    req.session.destroy((error) => {
        console.log(error);
        res.redirect('/');
    });
}