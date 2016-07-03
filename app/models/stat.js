var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var statSchema = new Schema({
    cid: {
    	type: Schema.Types.ObjectId,
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
    	required: true
    },
    device: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date
    }
}, { collection: 'statistics' });

statSchema.index({ cid: 1, browser: 1, device: 1, created: 1 });
statSchema.index({ cid: 1, created: 1 });
statSchema.index({ cid: 1, created: 1, browser: 1 });
statSchema.index({ cid: 1, created: 1, device: 1 });

statSchema.statics.process = function (query, opts) {
    var self = this;
    var start = new Date(); start.setHours(0, 0, 0, 0);
    var end = new Date(); end.setHours(23, 59, 59, 999);

    query.created = { $gte: start, $lte: end };
    self.findOne(query, function (err, doc) {
        if (err) return false;

        if (!doc) {
            doc = new self(opts);
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
