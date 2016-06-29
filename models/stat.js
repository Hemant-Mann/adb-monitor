var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var statSchema = new Schema({
    code_id: Schema.Types.ObjectId,
    pageviews: Number,
    blocked: Number
}, { collection: 'stats' });


var Stat = mongoose.model('Stat', statSchema);
module.exports = Stat;
