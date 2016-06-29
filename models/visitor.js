var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var visitSchema = new Schema({
    code_id: Schema.Types.ObjectId,
    cookie: String,
    unique: Number,
    total: Number
}, { collection: 'visits' });


var Visitor = mongoose.model('Visitor', visitSchema);
module.exports = Visitor;
