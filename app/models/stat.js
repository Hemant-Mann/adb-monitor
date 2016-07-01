var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var statSchema = new Schema({
    code_id: {
    	type: Schema.Types.ObjectId,
    	index: true,
    	required: true
    },
    blocking: {
    	type: Number,
    	required: true
    },
    allowing: {
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
            doc.blocking = 0;
            doc.allowing = 0;
        }

        // 0 => not blocked, 1 => blocked
        if (opts.blocking === 0) {
            doc.allowing++;
        } else {
            doc.blocking++;
        }
        doc.modified = Date.now();
        doc.save();
    });
};


var Stat = mongoose.model('Stat', statSchema);
module.exports = Stat;
