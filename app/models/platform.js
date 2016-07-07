var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var platformSchema = new Schema({
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
}, { collection: 'platforms' });

platformSchema.index({ _id: 1, live: 1 });
platformSchema.index({ uid: 1, live: 1 });
platformSchema.index({ uid: 1, domain: 1 });

platformSchema.statics.parseDomain = function (value) {
    var domain = value.toLowerCase(), matches;
    if (domain.indexOf('http://') !== -1 || domain.indexOf('https://') !== -1) {
        matches = domain.match(/https?:\/\/(.*)/);
        domain = matches[1];

        domain = domain.replace(/\//g, '');
    }
    return domain;
}

// pre + post middleware of Mongoose schema
platformSchema.pre('save', function (next) {
    var self = this;

    self.domain = mongoose.model('Platform').parseDomain(self.domain);
    next();
});

var Platform = mongoose.model('Platform', platformSchema);
module.exports = Platform;
