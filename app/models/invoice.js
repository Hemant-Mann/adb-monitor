var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var invSchema = new Schema({
    uid: {
        type: Schema.Types.ObjectId,
        required: true
    },
    plan: { // plan id
    	type: Schema.Types.ObjectId,
    	required: true
    },
    amount: {
    	type: Number,
    	required: true
    },
    payid: {    // paypal payment id
        type: String,
        required: true
    },
    created: {
        type: Number,
        required: true
    },
    live: {
        type: Boolean,
        default: false,
    }
}, { collection: 'invoices' });

invSchema.index({ _id: 1, live: 1 });

// pre + post middleware of Mongoose schema
invSchema.pre('save', function (next) {
    var self = this;

    next();
});

var Invoice = mongoose.model('Invoice', invSchema);
module.exports = Invoice;
