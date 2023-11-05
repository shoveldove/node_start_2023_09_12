const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.login_form = (req, res) => {

    res.render('login', { title: 'Login' })

};

exports.register_form = (req, res) => {

    res.render('register', { title: "Register", body: {} })

};

exports.validate_registration = (req, res, next) => {

    req.sanitizeBody('username');
    req.checkBody('username', 'User name is required.').notEmpty();
    req.checkBody('email', 'Valid email is required.').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password is required.').notEmpty();
    req.checkBody('confirm_password', 'Password confirmation is required.').notEmpty();
    req.checkBody('confirm_password', 'Passwords must match.').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', { title: 'Register', body: req.body, flashes: req.flash() })
        return; // stop the function from running
    }

    next(); // there were no errors

};

exports.register = async (req, res, next) => {

    const user = new User({ email: req.body.email, username: req.body.username });
    const register = promisify(User.register, User);
    //req.body.username = req.body.email;
    await register(user, req.body.password);
    //console.log(req.body);
    next(); // pass to authController.login

};

exports.account_page = (req, res) => {

    res.render('edit_account', { title: 'Edit Account' });

}

exports.update_account = async (req, res) => {

    const updates = {

        //username: req.body.username,
        email: req.body.email

    };

    const user = await User.findOneAndUpdate(

        { _id: req.user._id },                               // query
        { $set: updates },                                   // update
        { new: true, runValidators: true, context: 'query' } // options

    );

    //res.json(user);
    req.flash('success', 'Account Updated.')
    res.redirect('account');

};