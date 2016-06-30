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
    }
}, { collection: 'statistics' });


var Stat = mongoose.model('Stat', statSchema);
module.exports = Stat;
