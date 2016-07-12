var Utils = require('../scripts/util');
var Plat = require('../models/platform');
var Stat = require('../models/stat');

var Platform = {
	quickStats: function (user, cb) {
		Plat.find({uid: user._id}, '_id', function (err, platforms) {
            if (err) return cb(Utils.commonMsg(500));

            if (platforms.length === 0) {
                return cb(null, {});
            }

            var ids = [];
            platforms.forEach(function (el) {
                ids.push(el._id);
            });

            Stat.find({ pid: {$in : ids}}, 'allow block', function (err, stats) {
                if (err || stats.length == 0) return cb(null, {});

                var pageviews = 0, allowing = 0, blocking = 0;
                stats.forEach(function (el) {
                    allowing += el.allow;
                    blocking += el.block;

                    pageviews += el.allow + el.block;
                });
                var quickStats = {
                    pageviews: pageviews,
                    allowing: allowing,
                    blocking: blocking,
                    percent: Number((blocking / pageviews) * 100).toFixed(2)
                }
                return cb(null, quickStats);
            });
        });
	}
}

module.exports = Platform;