var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var statSchema = new Schema({
    code_id: {
    	type: Schema.Types.ObjectId,
    	index: true,
    	required: true
    },
    pageviews: {
    	type: Number,
    	required: true
    },
    blocked: {
    	type: Number,
    	required: true
    },
    device: {
    	type: String,
    	index: true,
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
    }
}, { collection: 'statistics' });


var Stat = mongoose.model('Stat', statSchema);
module.exports = Stat;
