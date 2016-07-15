var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var visitSchema = new Schema({
    pid: {
        type: Schema.Types.ObjectId,
        required: true
    },
    device: String,
    country: String,
    cookie: {
        type: String
    },
    whitelist: {
        status: Boolean,
        time: Date
    },
    total: {
        type: Number,
        default: 0
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: Date,
    last: Date
}, { collection: 'visitors' });

visitSchema.index({ pid: 1, cookie: 1, device: 1 });
visitSchema.index({ pid: 1, device: 1, modified: 1 });
visitSchema.index({ pid: 1, modified: 1 });
visitSchema.index({ pid: 1, created: 1 });

visitSchema.statics.process = function (opts, extra, cb) {
	var self = this;
    var start = new Date(); start.setHours(0, 0, 0, 0);
    var end = new Date(); end.setHours(23, 59, 59, 999);

	self.findOne(opts, function (err, visitor) {
		if (err) return cb(true);

		if (!visitor) {
			visitor = new self(opts);
            visitor.total = 0;
		} else {
            if ((visitor.last || 0) >= extra.time) {
                return cb(true);   // user doing something fishy
            }
        }
        visitor.last = extra.time;

        if (!visitor.country) {
            visitor.country = extra.country;
        }

        visitor.total += 1;
        visitor.modified = Date.now();

        if (extra.whitelist) {
            visitor.whitelist.status = true;
            visitor.whitelist.time = Date.now();
        } else {
            visitor.whitelist.status = false;
        }
        visitor.save();
        cb(false);
	});
};

var Visitor = mongoose.model('Visitor', visitSchema);
module.exports = Visitor;
