const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const store = require('../models/store');

const multer_options = {

    storage: multer.memoryStorage(),
    file_filter(req, file, next) {
        const is_photo = file.mimetype.startsWith('image/');
        if (is_photo) {
            next(null, true);
        } else {
            next({ message: 'That type of file is not allowed.' }, false)
        }

    }

};

exports.store_middleware_001 = (req, res, next) => {

    req.name = 'AAA';
    next();

};

exports.home_page = (req, res) => {

    req.flash('error', "Something Happened - Error A")
    req.flash('error', "Something Happened - Error B")
    req.flash('error', "Something Happened - <b>Error C<b>")
    req.flash('info', "Something Happened - Info")
    req.flash('warning', "Something Happened - Warning")
    req.flash('success', "Something Happened - Success")

    res.render('index', {
        title: 'Home'
    });

};

exports.add_store = (req, res) => {

    res.render('edit_store', {
        title: 'Add Store'
    });

};

exports.upload_photo = multer(multer_options).single('photo');

exports.resize = async (req, res, next) => {

    // check if there is is no new file to resize
    if (!req.file) {
        next(); //skip to the next middleware
        return;
    }

    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    // resize photo
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);

    // after writing / saving the (resized) photo to the file system, keep going.
    next();

};

exports.create_store = async (req, res) => {

    req.body.author = req.user._id;
    const store = await (new Store(req.body)).save();
    await store.save();
    req.flash('success', `Successfully Created ${store.name}. Would you like to leave a review?`);
    res.redirect(`/store/${store.slug}`);

};

exports.get_stores = async (req, res) => {

    const page = req.params.page || 1;
    const limit = 6;
    const skip = (page * limit) - limit;

    // 1. Query the database for a list of all stores
    const stores_promise = await Store
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ created: 'desc' });

    const count_promise = Store.count();

    const [stores, count] = await Promise.all([stores_promise, count_promise]);

    const pages = Math.ceil(count / limit);
    if (!stores.length && skip) {

        req.flash('info', `Hey! It seems like like you\'re looking for page ${page}.
        That page dosen\'t exist buddy! You\'ve been re-routed to page ${pages}.`);
        res.redirect(`/stores/page/${pages}`);
        return;

    };


    res.render('stores', {
        title: 'Stores',
        stores,
        page,
        pages,
        count
    });

};


const confirm_owner = (store, user) => {

    if (!store.author.equals(user._id)) {

        throw Error('Stores can only be edited by their reigstered owners.')

    }

};

exports.edit_store = async (req, res) => {

    // 1. Find the store given the ID
    const store = await Store.findOne({ _id: req.params.id });

    // 2. Confirm they are the owner of the store
    confirm_owner(store, req.user);

    // 3. Render out the edit form so the user can update their store
    res.render('edit_store', { title: `Edit ${store.name}`, store });

};

exports.update_store = async (req, res) => {
    // 0. Set the location data to be a point
    req.body.location.type = 'Point';

    // 1. Find and update the store
    const store = await Store.findOneAndUpdate(
        { _id: req.params.id }, req.body, {
        new: true, // return new store instead of old
        runValidators: true
    }).exec();
    req.flash('success', `Successfully updated <b>${store.name}<b>.<br>
        <a href="/stores/${store.slug}">View Store</a>`)

    // 2. Redirect user to the store and tell them it worked
    res.redirect(`/stores/${store.id}/edit`);

};

exports.get_store_by_slug = async (req, res, next) => {

    const store = await Store.findOne({ slug: req.params.slug }).populate('author reviews');
    if (!store) return next();
    res.render('store', { store, title: store.name });
};

exports.get_stores_by_tag = async (req, res) => {

    const tag = req.params.tag;
    const tag_query = tag || { $exists: true };
    const tags_promise = Store.get_tag_list();
    const stores_promise = Store.find({ tags: tag_query });
    const [tags, stores] = await Promise.all([tags_promise, stores_promise]);

    res.render('tags', { tags, title: 'Tags', tag, stores });

};

exports.search_stores = async (req, res) => {

    const stores = await Store.find({
        // first find stores that match search
        $text: {

            $search: req.query.q,

        }

    }, {

        score: { $meta: 'textScore' }

    }).sort({ // then sort the returned list

        score: { $meta: 'textScore' }

    }).limit(5); // limit to five results

    res.json(stores);

};

exports.map_stores = async (req, res) => {

    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
    const q = {

        location: {

            $near: {

                $geometry: {

                    type: 'Point',
                    coordinates

                },

                $maxDistance: 10000 // 10km 

            }

        }

    };

    const stores = await Store.find(q).select('slug name description location photo').limit(10);
    res.json(stores);

};

exports.map_page = (req, res) => {

    res.render('map', { title: 'Map' });

};

exports.heart_store = async (req, res) => {

    const hearts = req.user.hearts.map(obj => obj.toString());
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
    const user = await User
        .findByIdAndUpdate(req.user._id,
            { [operator]: { hearts: req.params.id } },
            { new: true }
        );

    res.json(user);

};

exports.get_hearted_stores = async (req, res) => {

    const stores = await Store.find({

        _id: { $in: req.user.hearts }

    });

    res.render('stores', { title: 'Hearted Stores', stores });
};


exports.get_top_stores = async (req, res) => {

    const stores = await store.get_top_stores();
    res.render('top_stores', { stores, title: 'Top Stores!' });

}