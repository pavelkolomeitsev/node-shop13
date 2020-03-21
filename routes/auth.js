const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getResetPassword);

router.get('/reset/:token', authController.getNewPassword);

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(), // no start with Uppercase, no whitespaces
    body('password', 'Please enter a password at least 6 characters and only numbers and characters')
        .isLength({ min: 6 })
        .isAlphanumeric()
        .trim(), // no whitespaces
], authController.postLogin);

// check() - will return a middleware
// from signup-page we get form-fields name-properties
// isEmail() - will check what the user has inputed
router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            // if (value === 'test@test.com') {
            //     throw new Error('This email is forbidden');
            // }
            // return true;
            return User.findOne({ email: value }).then(userDoc => {
                // if it`s true -> try again
                if (userDoc) {
                    return Promise.reject('Email exists already');
                }
            });
        })
        .normalizeEmail(),
    body('password', 'Please enter a password at least 6 characters and only numbers and characters')
        .isLength({ min: 6 })
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password and confirmPassword should match');
            }
            return true;
        })
], authController.postSignup);

router.post('/logout', authController.postLogout);

router.post('/reset', authController.postResetPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;