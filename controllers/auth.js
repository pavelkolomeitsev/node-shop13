

// we just redirect the user to login-page
exports.getLogin = (req, res, next) => {
    // in html-form two important things action="/product" - path, method="POST"
    // should match with router command (post/get/put/delete)

    const isLoggedIn = req.get('Cookie').split('=')[1];

    res.render('auth/login', { pageTitle: 'Login', path: '/login', isAuthenticated: isLoggedIn });
}

exports.postLogin = (req, res, next) => {

    // set a cookie
    res.setHeader('Set-Cookie', 'loggedIn=true'); // loggedIn=true - (key : value) pair
    res.redirect('/');
}