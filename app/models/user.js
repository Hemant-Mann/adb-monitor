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
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    },
    credits: {
        type: Number,
        required: true,
        default: 0
    },
    used: Number,
    admin: Boolean,
    live: {
        type: Boolean,
        default: false
    }
}, { collection: 'users' });

UserSchema.index({ email: 1 });
UserSchema.index({ _id: 1, live: 1 });

UserSchema.methods.authenticate = function (password) {
    return this.password === this.hashPassword(password);
};

UserSchema.methods.hashPassword = function (password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

// pre + post middleware of Mongoose schema
UserSchema.pre('save', function (next) {
    var self = this;

    if (self.password) {
        self.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        self.password = self.hashPassword(self.password);

        self.modified = Date.now();
        next();
    } else {
        next(new Error("Password is required"));
    }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
