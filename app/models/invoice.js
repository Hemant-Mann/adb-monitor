var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var invSchema = new Schema({
    uid: {
        type: type: Schema.Types.ObjectId,
        required: true
    },
    subid: {
    	type: Schema.Types.ObjectId,
    	required: true
    },
    price: {
    	type: Number,
    	required: true
    },
    payid: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Number,
        required: true
    }
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
