var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Utils = require('../scripts/util');

// create a schema
var metaSchema = new Schema({
    prop: String,
    pid: Schema.Types.ObjectId, // property id
    val: String,
    created: {
    	type: Date,
    	default: Date.now
    },
    misc: {}
}, { collection: 'metas' });

metaSchema.index({ prop: 1, pid: 1 });
metaSchema.index({ prop: 1, created: 1 });

var Meta = mongoose.model('Meta', metaSchema);
module.exports = Meta;
