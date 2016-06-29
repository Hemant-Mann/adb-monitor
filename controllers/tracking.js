// models
var mongoose = require('../mongoose')();
var Stat = mongoose.model('Stat'),
	Code = mongoose.model('Stat'),
	Visitor = mongoose.model('Visitor'),
	User = mongoose.model('User');



var Tracking = {
	validate: function (opts, cb) {
		Code.findOne({ _id: opts.code_id }, cb);
	}
};

var execute = function (req, res, next) {
	console.log(req.query);
	next();
};

module.exports = execute;