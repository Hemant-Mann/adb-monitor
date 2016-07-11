var Visitor = require('../models/visitor');
var Invoice = require('../models/invoice');
var Platform = require('../models/platform');

var Account = {
	billing: function (user, cb) {
		var self = this;

        Platform.find({ uid: user._id }, '_id', function (err, platforms) {
            if (err) return cb(err);

            var ids = [];
            platforms.forEach(function (el) {
                ids.push(el._id);
            });

            var start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
            var end = new Date();
            var query = { pid: {$in: ids}, modified: {$gte: start, $lte: end}};

            Visitor.count(query, function (err, c) {
                return cb(null, c || 0);
            });
        });
	}
}

module.exports = Account;