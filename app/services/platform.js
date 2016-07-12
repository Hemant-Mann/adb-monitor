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
	},
	api: function (req, res, next) {
		var cb = req.query.callback;
        if (!req.params.pid || !cb) return next(new Error("Invalid Request"));

        Plat.findOne({ _id: Utils.parseParam(req.params.pid) }, 'whitelist', function (err, p) {
            if (err || !p) {
                var err = new Error("Invalid Request");
                err.status = 400;
                return next(err);
            }

            var platform = {
                whitelist: p.whitelist
            };

            res.send(cb + "(" + JSON.stringify(platform) + ")");
        });
	},
	find: function (req, res, next) {
		if (!req.user) return res.redirect('/auth/login');
        Plat.findOne({ _id: Utils.parseParam(req.params.id), uid: req.user._id }, function (err, platform) {
            if (err || !platform) {
                var err = new Error("Platform not found");
                err.type = "json"; err.status = 400;
                return next(err);
            }

            req.platform = platform;
            next();
        });
	}
}

module.exports = Platform;