var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var codeSchema = new Schema({
    user_id: {
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
        default: false
    }
}, { collection: 'codes' });

// pre + post middleware of Mongoose schema
codeSchema.pre('save', function (next) {
    var self = this;
    mongoose.model('Code').findOne({user_id: self.user_id, domain: self.domain.toLowerCase()}, function(err, code) {
        if (err) return next(new Error("Internal Server Error"));
        if (code) return next(new Error("Platform already exists"));

        self.domain = self.domain.toLowerCase();
        next();
    });
});

var Code = mongoose.model('Code', codeSchema);
module.exports = Code;
