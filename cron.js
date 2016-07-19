var env = process.env.NODE_ENV || 'development';
var mongoose = require('mongoose');
var db = require('./mongoose')(env);
var fs = require('fs');
var async = require('async');

var Utils = require('./app/scripts/util');
var User = require('./app/models/user'),
	Visitor = require('./app/models/visitor'),
	Platform = require('./app/models/platform'),
	Meta = require('./app/models/meta');

var logFile = fs.createWriteStream('./logs/' + Utils.today() + '.txt', {flags: 'a'});

async.waterfall([
	function (callback) {
		var end = new Date();
		end.setDate(end.getDate() - 1);
		end.setHours(0, 0, 0, 0);

		Meta.remove({ created: { $lte: end }}, function (err) {
			callback();
		});
	},
	function (callback) {
		Platform.find({}, '_id uid', callback);
	},
	function (platforms, callback) {
		var group = {},
			total = 0,
			dateQuery = Utils.dateQuery();

		platforms.forEach(function (el) {
			var key = el.uid;
			if (typeof group[key] === "undefined") {
				total++;
				group[key] = [];
			}
			group[key].push(el._id);
		});

		var current = 0,
			credits = {};

		Object.keys(group).forEach(function (u) {
			Visitor.count({
				created: {
					$gte: dateQuery.start,
					$lte: dateQuery.end
				},
				pid: {
					$in: group[u]
				}
			}, function (err, c) {
				current++;

				credits[u] = c || 0;

				if (current === total) {
					callback(null, credits, current);
				}
			});
		});
	},
	function (credits, total, callback) {
		var i = 1;

		Object.keys(credits).forEach(function (id) {
			User.findOne({ _id: id }, function (err, u) {
				if (err || !u) {
					if (i === total) {
						return callback();
					} else ++i;
				}

				if (!u.used) {
					u.used = 0;
				}
				u.used = u.used + Number(credits[id]);

				if (u.used > u.credits) {
					Platform.update({ uid: id }, {$set: {live: false}}, function (err) {
						u.save(function (err) {
							if (i === total) {
								return callback();
							} else ++i;
						});
					});
				} else {
					u.save(function (err) {
						if (i === total) {
							return callback();
						} else ++i;
					});
				}
			});
		});
	}
], function (err) {
	mongoose.connection.close();
	if (err) {
		logFile.write(err);
	}
	logFile.end();
});
