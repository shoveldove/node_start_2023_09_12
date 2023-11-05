const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodb_error_handler = require('mongoose-mongodb-errors');
const passport_local_mongoose = require('passport-local-mongoose');

const userSchema = new Schema({

    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: 'Please Supply an Email Address'
    },
    username: {
        type: String,
        required: 'Please supply a name.',
        trim: true
    },
    reset_password_token: String,
    reset_password_expiration: Date,
    hearts: [

        {type: mongoose.Schema.ObjectId, ref: 'Store'}

    ]

});

userSchema.virtual('gravatar').get(function () {

    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`

})

//userSchema.plugin(passport_local_mongoose, { usernameField: 'email' });
userSchema.plugin(passport_local_mongoose);
userSchema.plugin(mongodb_error_handler);

module.exports = mongoose.model('User', userSchema)