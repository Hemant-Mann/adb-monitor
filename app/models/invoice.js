var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var invSchema = new Schema({
    uid: {
        type: Schema.Types.ObjectId,
        required: true
    },
    visitors: {
        type: Number,
        required: true
    },
    amount: {
    	type: String,
    	required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    payid: {    // paypal payment id
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        set: function (val) {
            return Date.now();
        }
    },
    live: {
        type: Boolean,
        default: false,
    }
}, { collection: 'invoices' });

invSchema.index({ _id: 1, live: 1, uid: 1 });
invSchema.index({ uid: 1 });

invSchema.statics.calculate = function (visitors) {
    var data = {};
    visitors = Number(visitors);

    switch (visitors) {
    case 50000:
        data.visitors = visitors;
        data.price = 10;
        break;

    case 100000:
        data.visitors = visitors;
        data.price = 20;
        break;

    case 250000:
        data.visitors = visitors;
        data.price = 50;
        break;

    default:
        data.visitors = visitors;
        data.price = Number(visitors / 5000);
    }

    data.price = data.price.toFixed(2);
    return data;
}

// pre + post middleware of Mongoose schema
invSchema.pre('save', function (next) {
    var self = this;
    if (!self.currency) {
        self.currency = 'USD';
    }
    next();
});

var Invoice = mongoose.model('Invoice', invSchema);
module.exports = Invoice;
