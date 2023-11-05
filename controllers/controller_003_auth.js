const passport = require('passport');
const crypto = require('crypto')
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail')

exports.login_user = passport.authenticate('local', {

    failureRedirect: '/login',
    failureFlash: 'Login Failed.',
    successRedirect: '/',
    successFlash: 'You are now logged in.'

}

);

exports.logout_user = (req, res) => {

    req.logout();
    req.flash('success', 'You are now logged out.');
    res.redirect('/');

};

exports.is_logged_in = (req, res, next) => {

    // 1. Check if user is authenticated 

    if (req.isAuthenticated()) {

        next(); // proceed - user is logged in

        return;

    }

    req.flash('error', 'Must be logged-in to view this page');
    res.redirect('/login');

};

exports.forgot_password = async (req, res) => {

    // 1. Determine if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {

        req.flash('error', 'No account with that email is found.');
        return res.redirect('/login');

    }

    // 2. If user exists, set reset tokens and related expiration on their account
    user.reset_password_token = crypto.randomBytes(20).toString('hex');
    user.reset_password_expiration = Date.now() + 3600000; // 1 hour from "now"
    await user.save();

    // 3. Send user an email with the token
    const password_reset_url = `http://${req.headers.host}/account/reset/${user.reset_password_token}`;
    mail.send_email({

        user,
        subject: 'Password Reset',
        password_reset_url,
        file_name: 'reset_password_email'

    });

    req.flash('success', `Password reset link has been emailed.`);

    // 4. Redirect user to login page
    res.redirect('/login');

};

exports.reset_password = async (req, res) => {

    const user = await User.findOne({

        reset_password_token: req.params.token,
        reset_password_expiration: { $gt: Date.now() }

    });

    // if token reset is invalid, explain to user and re-route

    if (!user) {

        req.flash('error', 'Password reset is either invalid or expired');
        return res.redirect('/login');

    }

    // if token reset is valid, show the reset password form
    res.render('reset_password', { title: 'Password Reset' })

};

exports.confirm_password = (req, res, next) => {

    if (req.body.password === req.body.confirm_password) {

        next(); // keep going!
        return

    }

    req.flash('error', 'Passwords do not match');
    res.redirect('back');

};

exports.update_password = async (req, res) => {

    const user = await User.findOne({

        reset_password_token: req.params.token,
        reset_password_expiration: { $gt: Date.now() }

    });

    if (!user) {

        req.flash('error', 'Password reset is either invalid or expired');
        return res.redirect('/login');

    };

    const set_password = promisify(user.setPassword, user);

    await set_password(req.body.password);

    user.reset_password_token = undefined;
    user.reset_password_expiration = undefined;
    const updated_user = await user.save();

    await req.login(updated_user);

    req.flash('success', 'Password reset successful; Login completed.');
    res.redirect('/');

};