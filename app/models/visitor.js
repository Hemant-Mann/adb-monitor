var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var visitSchema = new Schema({
    code_id: Schema.Types.ObjectId,
    cookie: String,
    unique: Number,
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
	self.findOne({ code_id: opts.code_id, cookie: opts.cookie }, function (err, visitor) {
		if (err) return cb(true, null);

		if (!visitor) {
			visitor = new self({
				code_id: opts.code_id,
				cookie: opts.cookie
			});
		}
	});
}

var Visitor = mongoose.model('Visitor', visitSchema);
module.exports = Visitor;
