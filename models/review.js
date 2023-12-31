const mongoose = require('mongoose');
const { authorize } = require('passport');
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({

    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'Author required.'
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: 'Store required.'
    },
    text: {
        type: String,
        required: 'Text required.'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
});

function autopopulate(next) {

    this.populate('author');
    next();

};

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Review', reviewSchema);