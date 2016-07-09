var Visitor = require('../models/visitor');
var Plan = require('../models/plan');
var Invoice = require('../models/invoice');
var Platform = require('../models/platform');

var Account = {
	billing: function (subscription, user, cb) {
		var self = this;
		Plan.findOne({ _id: subscription.plan }, function (err, plan) {
            if (err || !plan) {
                return cb(new Error("Internal Server Error"));
            }

            Platform.find({ uid: user._id }, function (err, platforms) {
            	if (err) return cb(err);

            	var ids = [];
            	platforms.forEach(function (el) {
            		ids.push(el._id);
            	});

            	var start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
            	var end = new Date();
            	var query = { pid: {$in: ids}, modified: {$gte: start, $lte: end}};

            	Visitor.count(query, function (err, c) {
            		return cb(null, plan, c || 0);
            	});
            });
        });
	}
}

module.exports = Account;