var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var visitSchema = new Schema({
    cid: {
        type: Schema.Types.ObjectId,
        required: true
    },
    cookie: {
        type: String
    },
    total: Number,
    created: {
        type: Date,
        default: Date.now
    },
    modified: Date
}, { collection: 'visitors' });

visitSchema.index({ cid: 1, cookie: 1, created: 1 });
visitSchema.index({ cid: 1, created: 1 });

visitSchema.statics.process = function (opts, cb) {
	var self = this;
    var start = new Date(); start.setHours(0, 0, 0, 0);
    var end = new Date(); end.setHours(23, 59, 59, 999);

	self.findOne({
        cid: opts.cid,
        cookie: opts.cookie,
        created: { $gte: start, $lte: end }
    }, function (err, visitor) {
		if (err) return cb(true);

		if (!visitor) {
			visitor = new self({
				cid: opts.cid,
				cookie: opts.cookie,
                total: 0
			});
		}

        visitor.total += 1;
        visitor.modified = Date.now();
        visitor.save();
        cb(false);
	});
};

var Visitor = mongoose.model('Visitor', visitSchema);
module.exports = Visitor;
