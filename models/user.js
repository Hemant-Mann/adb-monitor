var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
    name: String,
    email: {
        type: String,
        required: true
    },
    password: String,
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    },
    admin: Boolean
}, { collection: 'users' });



var User = mongoose.model('User', userSchema);
module.exports = User;
