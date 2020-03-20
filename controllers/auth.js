const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
//const sendgrid = require('@sendgrid/mail');

const User = require('../models/user');

const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '1fc605583c190d',
        pass: '015fe8f0e44fa3',
    }
});

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
                    return transporter.sendMail({
                        to: email,
                        from: 'node_shop@node_complete.com',
                        subject: 'Signup succeeded',
                        html: '<h1>You successfully signed up!</h1><p>Get your<b>Money</b> today!</p>'
                    });
                })
                .catch(errpr => {
                    console.log(error);
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

exports.getResetPassword = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
};

exports.postResetPassword = (req, res, next) => {
    crypto.randomBytes(32, (error, buffer) => {
        if (error) {
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found!');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000; // 1 hour in milliseconds
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                return transporter.sendMail({
                    to: req.body.email,
                    from: 'node_shop@node_complete.com',
                    subject: 'Resetting password succeeded',
                    html: `
                        <p>You successfully resetted your password!</p>
                        <p>Click this link <a href="http://localhost:9000/reset/${token}"></a> to set a new password!</p>
                    `
                });
            })
            .catch(error => {
                console.log(error);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/new_password', {
                path: '/new_password',
                pageTitle: 'New Password',
                errorMessage: message,
                passwordToken: token,
                userId: user._id.toString()
            });

        })
        .catch(error => {
            console.log(error);
        });

};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(error => {
            console.log(error);
        });
};