var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var codeSchema = new Schema({
    uid: {
    	type: Schema.Types.ObjectId,
    	required: true
    },
    domain: {
    	type: String,
    	required: true
    },
    name: {
    	type: String,
    	required: true
    },
    created: {
        type: Date,
        default: Date.now,
    },
    modified: {
        type: Date,
        default: Date.now
    },
    live: {
        type: Boolean,
        default: false,
    }
}, { collection: 'codes' });

codeSchema.index({ uid: 1, live: 1 });
codeSchema.index({ uid: 1, domain: 1 });

// pre + post middleware of Mongoose schema
codeSchema.pre('save', function (next) {
    var self = this;

    self.domain = self.domain.toLowerCase();
    next();
});

var Code = mongoose.model('Code', codeSchema);
module.exports = Code;
