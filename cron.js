var env = process.env.NODE_ENV || 'development';
var mongoose = require('mongoose');
var db = require('./mongoose')(env);
var fs = require('fs');
var async = require('async');

var Utils = require('./app/scripts/util');
var User = require('./app/models/user'),
	Visitor = require('./app/models/visitor'),
	Platform = require('./app/models/platform');

var logFile = fs.createWriteStream('./logs/' + Utils.today() + '.txt', {flags: 'a'});

async.waterfall([
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
					// $gte: dateQuery.start,
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
		var i = 0;

		Object.keys(credits).forEach(function (id) {
			User.findOne({ _id: id }, function (err, u) {
				i++;
				if (err || !u) return;

				if (!u.used) {
					u.used = 0;
				}
				u.used += credits[id];

				if (u.used > u.credits) {
					Platform.update({ uid: id }, {$set: {live: false}}, function (err) {
						u.save(function (err) {
							if (i === total) {
								return callback();
							}
						});

					});
				} else {
					u.save(function (err) {
						if (i === total) {
							return callback();
						}
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
