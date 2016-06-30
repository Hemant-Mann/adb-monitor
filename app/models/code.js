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
    }
}, { collection: 'codes' });



var Code = mongoose.model('Code', codeSchema);
module.exports = Code;
