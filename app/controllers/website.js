var Shared = require('./controller');
var display = require('./tracking').display;
var User = require('../models/user');
var Stat = require('../models/stat');
var Platform = require('../models/platform');

var Utils = require('../scripts/util');
var pService = require('../services/platform');

/**
 * Website Controller
 */
var Website = (function () {
    'use strict';

    var w = Utils.inherit(Shared, 'Website');

    w.secure = ['stats', 'add', 'update', 'delete', 'getCode']; // Add Pages|Methods to this array which needs authentication
    w.defaultLayout = "layouts/client"; // change the layout
    
    w.stats = function (req, res, next) {
        var self = this,
            dateQuery = Utils.dateQuery(req.query),
            created = { $gte: dateQuery.start, $lte: dateQuery.end },
            device = req.query.device || '';

        self.view.platform = req.platform;
        self.view.today = Utils.today;

        display(req.platform._id, created, device, function (result) {
            self.view.stats = result.stats;
            self.view.total = result.total;

            next(null);
        });
    };

    w.add = function (req, res, next) {
        this.view.message = null;

        if (req.method === 'POST') {
            var platform = new Platform(req.body);
            platform.uid = req.user._id;
            platform.live = true;

            Platform.findOne({ uid: platform.uid, domain: Platform.parseDomain(platform.domain) }, '_id', function (err, p) {
                if (err) return next(Utils.commonMsg(500));

                if (p) return next({ message: "Platform already exists!!" });
                platform.save(function (err, p) {
                    if (err) return next(Utils.commonMsg(500));

                    next(Utils.commonMsg(200, 'Platform added'));
                });
            });
        } else {
            next(null);
        }
    };

    w._update = function (req, res, next) {
        var self = this; self._jsonView();

        var platform = req.platform;
        var live = req.body.live;

        if (live) {
            live = Number(live);
            platform.live = live;
        }
        
        platform.save();
        next(Utils.commonMsg(200, "Platform updated"));
    };

    w._delete = function (req, res, next) {
        this._jsonView();

        var p = req.platform;
        Stat.find({ pid: p._id }, '_id', function (err, stats) {
            if (err) return next(Utils.commonMsg(500));

            if (stats.length > 0) {
                return next({message: "You can't delete it try disabling the platform monitoring"});
            }

            p.remove(function (err) {
                if (err) return next(Utils.commonMsg(500));

                return next(Utils.commonMsg(200, 'Platform was removed'));
            });
        });
    };

    w.getCode = function (req, res, next) {
        this._jsonView();

        var _id = req.query.id;
        if (!_id) return next(Utils.commonMsg(400));

        this.view.code = '<script type="text/javascript">(function(){window.__adbMonID="'+ _id +'";function l(u){var e=document.createElement("script");e.type="text/javascript";e.src ="//monitoradblock.com/js/"+u;e.async=true;var x= document.getElementsByTagName("script")[0];x.parentNode.insertBefore(e, x);}l("adbmon.min.js");})();</script>';
        next(null);
    };

    w.api = function (req, res, next) {
        var cb = req.query.callback, pid = req.query.pid;
        if (!pid || !cb) return next(new Error("Invalid Request"));

        Platform.findOne({ _id: Utils.parseParam(pid) }, 'live', function (err, p) {
            if (err || !p) {
                var err = new Error("Invalid Request");
                err.status = 400;
                return next(err);
            }

            res.send(cb + "(" + JSON.stringify(p) + ")");
        });
    };

    w._find = function (req, res, next) {
        Platform.findOne({ _id: Utils.parseParam(req.params.id), uid: req.user._id }, function (err, p) {
            if (err) return next(Utils.commonMsg(400));

            req.platform = p;
            next();
        });
    };
    
    return w;
}());

module.exports = Website;
