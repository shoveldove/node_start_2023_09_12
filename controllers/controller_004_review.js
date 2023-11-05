const mongoose = require('mongoose');
const Review = mongoose.model('Review');

exports.add_review = async (req, res) => {

    req.body.author = req.user._id;
    req.body.store = req.params.id;
    const new_review = new Review(req.body);
    await new_review.save();
    req.flash('success', 'Review Saved!');
    res.redirect('back');

};
