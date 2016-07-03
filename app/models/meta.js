var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Utils = require('../scripts/util');

// create a schema
var metaSchema = new Schema({
    prop: String,
    pid: Schema.Types.ObjectId,
    val: String
}, { collection: 'metas' });

metaSchema.index({ prop: 1, pid: 1 });
metaSchema.index({ _id: 1, live: 1 });

var Meta = mongoose.model('Meta', metaSchema);
module.exports = Meta;