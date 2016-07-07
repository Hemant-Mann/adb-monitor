var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var subSchema = new Schema({
    uid: {
        type: Schema.Types.ObjectId,
        required: true
    },
    plan: {
        type: Schema.Types.ObjectId,
        required: true   
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    modified: {
        type: Date,
        default: Date.now
    },
    live: {
        type: Boolean,
        default: false,
    }
}, { collection: 'subscriptions' });

subSchema.index({ _id: 1, live: 1 });

// pre + post middleware of Mongoose schema
subSchema.pre('save', function (next) {
    var self = this;

    next();
});

var Subscription = mongoose.model('Subscription', subSchema);
module.exports = Subscription;
