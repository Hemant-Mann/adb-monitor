var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var planSchema = new Schema({
    name: {
    	type: String,
    	required: true
    },
    price: {
    	type: Number,
    	required: true
    },
    description: String,
    currency: {
        type: String,
        required: true
    },
    modified: {
        type: Date,
        default: Date.now
    },
    visitors: {
        type: Number,
        required: true
    },
    live: {
        type: Boolean,
        default: false,
    },
    period: { // No of days
        type: Number,
        required: true
    }
}, { collection: 'plans' });

planSchema.index({ _id: 1, live: 1 });

// pre + post middleware of Mongoose schema
planSchema.pre('save', function (next) {
    var self = this;

    next();
});

var Plan = mongoose.model('Plan', planSchema);
module.exports = Plan;
