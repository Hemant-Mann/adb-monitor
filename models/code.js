var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var codeSchema = new Schema({
    user_id: Schema.Types.ObjectId,
    domain: String,
    name: String
}, { collection: 'codes' });



var Code = mongoose.model('Code', codeSchema);
module.exports = Code;
