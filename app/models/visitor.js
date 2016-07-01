var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var visitSchema = new Schema({
    cid: Schema.Types.ObjectId,
    cookie: String,
    total: Number,
    created: {
        type: Date,
        index: true
    },
    modified: {
        type: Date,
        default: Date.now
    }
}, { collection: 'visitors' });

visitSchema.statics.process = function (opts, cb) {
	var self = this;
	self.findOne({ cid: opts.cid, cookie: opts.cookie }, function (err, visitor) {
		if (err) return cb(true);

		if (!visitor) {
			visitor = new self({
				cid: opts.cid,
				cookie: opts.cookie,
                total: 0,
                created: Date.now()
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
