var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;
var Utils = require('../scripts/util');

// create a schema
var UserSchema = new Schema({
    name: {
        type: String,
        required: [true, Utils.validationMsg('Name', 'required')]
    },
    email: {
        type: String,
        required: [true, Utils.validationMsg('Email', 'required')],
        index: true,
        match: [/.+\@.+\..+/, Utils.validationMsg('Email', 'regex')]
    },
    password: {
        type: String,
        validate: {
            validator: function (p) {
                return p && p.length >= 8
            },
            message: Utils.validationMsg('Password', 'min', {len: 8})
        },
        required: [true, Utils.validationMsg('Password', 'required')]
    },
    salt: String,
    created: {
        type: Date,
        default: Date.now,
        index: true
    },
    modified: {
        type: Date,
        default: Date.now
    },
    admin: Boolean
}, { collection: 'users' });

UserSchema.methods.authenticate = function (password) {
    return this.password === this.hashPassword(password);
};

UserSchema.methods.hashPassword = function (password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

// pre + post middleware of Mongoose schema
UserSchema.pre('save', function (next) {
    var self = this;
    mongoose.model('User').findOne({email: self.email.toLowerCase()}, function(err, user) {
        if (err) return next(new Error("Internal Server Error"));
        if (user) return next(new Error("Email already exists"));

        if (self.password) {
            self.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
            self.password = self.hashPassword(self.password);
        } else {
            next(new Error("Password is required"));
        }
        next();
    });
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
