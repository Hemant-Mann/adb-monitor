var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var codeSchema = new Schema({
    uid: {
    	type: Schema.Types.ObjectId,
    	index: true,
    	required: true
    },
    domain: {
    	type: String,
    	index: true,
    	required: true
    },
    name: {
    	type: String,
    	required: true
    },
    created: {
        type: Date,
        default: Date.now,
        index: true
    },
    modified: {
        type: Date,
        default: Date.now
    },
    live: {
        type: Boolean,
        default: false,
        index: true
    }
}, { collection: 'codes' });

// pre + post middleware of Mongoose schema
codeSchema.pre('save', function (next) {
    var self = this;

    self.domain = self.domain.toLowerCase();
    next();
});

var Code = mongoose.model('Code', codeSchema);
module.exports = Code;
