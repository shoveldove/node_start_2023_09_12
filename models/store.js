const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({

    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name.'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'Coordinates are required.'
        }],
        address: {
            type: String,
            required: 'Address is required.'
        }
    },
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'Author Required.'
    }
}, {

    toJSON: { virtuals: true },
    toObject: { virtuals: true },

});

// Define our indices
storeSchema.index({

    name: 'text',
    description: 'text',

});

storeSchema.index({ location: '2dsphere' });

storeSchema.pre('save', async function (next) {
    if (!this.isModified('name')) {
        next(); // skip it
        return; // stop this function from running
    }
    this.slug = slug(this.name);
    // find other stores with similar / identical slugs
    const slug_regex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const stores_with_slug = await this.constructor.find({ slug: slug_regex });
    if (stores_with_slug.length) {

        this.slug = `${this.slug}-${stores_with_slug.length + 1}`;

    }

    next();
    // TODO - Make more resiliant so that slugs are unique

});

storeSchema.statics.get_tag_list = function () {

    return this.aggregate([

        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } }

    ]);

};

storeSchema.statics.get_top_stores = function () {

    return this.aggregate([

        // lookup stores and populate their reviews
        {
            $lookup: {
                from: 'reviews', // supposedly, mongo DB will use the 'Review' field from the storeSchema.virtual
                // block below, and intake a field called "reviews", by under-casing the R, and
                // adding a pluralizing "s"   
                localField: '_id',
                foreignField: 'store',
                as: 'reviews'
            }
        },

        // filter for stores which have two or more reviews
        {
            $match: {
                'reviews.1': {
                    $exists: true
                }
            }
        },

        // add field for average reviews
        {
            $addFields: {
                //photo: '$$ROOT.photo',
                //name: '$$ROOT.name',
                //reviews: '$$ROOT.reviews',
                average_rating: { $avg: '$reviews.rating' }
            }
        },

        // sort by this new field, highest reviews first
        {
            $sort: {
                average_rating: -1
            }
        },

        // limit presented QTY of top stores
        { $limit: 10 }


    ]);

}

// find reviews where the stores _id property === reviews store property

storeSchema.virtual('reviews', {

    ref: 'Review',          // which model should be linked?
    localField: '_id',      // which field on the store?
    foreignField: 'store'   // which field on the review?

});

function auto_populate(next) {

    this.populate('reviews');
    next();

};

storeSchema.pre('find', auto_populate);
storeSchema.pre('findOne', auto_populate);

module.exports = mongoose.model('Store', storeSchema);