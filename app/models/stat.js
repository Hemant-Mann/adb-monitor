var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var statSchema = new Schema({
    cid: {
    	type: Schema.Types.ObjectId,
    	index: true,
    	required: true
    },
    block: {
    	type: Number,
    	required: true
    },
    allow: {
        type: Number,
        required: true
    },
    browser: {
    	type: String,
    	index: true,
    	required: true
    },
    device: {
        type: String,
        index: true,
        required: true
    },
    created: {
        type: Date,
        index: true
    },
    modified: {
        type: Date,
        default: Date.now
    }
}, { collection: 'statistics' });

statSchema.statics.process = function (query, opts) {
    var self = this;
    self.findOne(query, function (err, doc) {
        if (err) return false;

        if (!doc) {
            doc = new self(opts);
            doc.created = Date.now();
            doc.block = 0;
            doc.allow = 0;
        }

        // 0 => not blocked, 1 => blocked
        if (opts.block === 0) {
            doc.allow++;
        } else {
            doc.block++;
        }
        doc.modified = Date.now();
        doc.save();
    });
};


var Stat = mongoose.model('Stat', statSchema);
module.exports = Stat;
