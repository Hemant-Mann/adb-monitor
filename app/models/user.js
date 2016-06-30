var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

// create a schema
var UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true,
        match: [/.+\@.+\..+/, "Please fill a valid e-mail address"]
    },
    password: {
        type: String,
        validate: [
            function (password) {
                return password && password.length >= 8
            }, 'password should be longer'
        ]
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
    if (this.password) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
    next();
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
