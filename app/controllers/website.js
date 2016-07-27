var Shared = require('./controller');
var display = require('./tracking').display;
var User = require('../models/user');
var Stat = require('../models/stat');
var Meta = require('../models/meta');
var Platform = require('../models/platform');

var Utils = require('../scripts/util');
var pService = require('../services/platform');
var config = require('../config/mail');
var async = require('async');

/**
 * Website Controller
 */
var Website = (function () {
    'use strict';

    var w = Utils.inherit(Shared, 'Website');

    w.secure = ['stats', 'add', 'update', 'delete', 'getCode', 'manage', 'adblocker']; // Add Pages|Methods to this array which needs authentication

    w._secure = function (req, res) {
        var basic = this.parent._secure.call(this, req, res);
        if (!basic) res.redirect('/auth/login.html');
    };

    w._initView = function () {
        this.parent._initView.call(this);
        this.defaultLayout = "layouts/client";
    };
    
    w.stats = function (req, res, next) {
        var self = this,
            dateQuery = Utils.dateQuery(req.query),
            created = { $gte: dateQuery.start, $lte: dateQuery.end },
            device = req.query.device || '';

        self.view.platform = req.platform;
        self.view.today = Utils.today;
        this.seo.title = "Platform Stats - " + self.view.platform.name + " | " + config.platform;

        display(req.platform._id, created, device, function (result) {
            self.view.stats = result.stats;
            self.view.total = result.total;

            next(null);
        });
    };

    w.add = function (req, res, next) {
        this.view.message = null;
        this.seo.title = "Add a website | " + config.platform;
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
        if (req.user.used >= req.user.credits) {
            platform.live = false;
            platform.save();
            return next({message: 'Please add more credits to your account to enable tracking!!'});
        }

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

        Platform.findOne({ _id: Utils.parseParam(pid) }, 'live domain _id', function (err, p) {
            if (err || !p) {
                var err = new Error("Invalid Request");
                err.status = 400;
                return next(err);
            }
            var data = { live: p.live, html: '', visits: 3 };
            if (!data.live) { // render the adblocker template
                return res.send(cb + "(" + JSON.stringify(data) + ")");
            }

            Meta.findOne({'prop': 'platform', pid: p._id}, 'misc _id', function (err, meta) {
                if (err || !meta) {
                    meta = {}; meta.misc = {};
                }
                var misc = meta.misc || {};
                
                Utils.renderTemplate('default', {
                    domain: p.domain, meta: misc
                }, function (err, html) {
                    data.html = html || '';
                    data.visits = Number(misc.visits) || 3;
                    return res.send(cb + "(" + JSON.stringify(data) + ")");
                });
            });
        });
    };

    w._find = function (req, res, next) {
        Platform.findOne({ _id: Utils.parseParam(req.params.id), uid: req.user._id }, function (err, p) {
            if (err) return next(Utils.commonMsg(400));

            req.platform = p;
            next();
        });
    };

    w.adblocker = function (req, res, next) {
        var platform = req.platform,
            self = this,
            query = { prop: 'platform', pid: platform._id };
        Utils.setObj(self.view, {
            message: 'Turn On Your AdBlocker to see the page!!', settings: {}, platform: platform
        });

        Meta.findOne(query, function (err, m) {
            if (err) return next(Utils.commonMsg(500));
            if (!m && req.method !== 'POST') return next();

            if (req.method === 'POST') {
                if (!m) m = new Meta(query);
                m.val = 'adblocker';
                m.misc = {
                    message: req.body.message,
                    img: req.body.img,
                    visits: Number(req.body.visits)
                };
                m.save();
                self.view.settings = m.misc;
                next({ message: "AdBlocker Settings updated!! "});
            } else {
                self.view.settings = m.misc;
                next();
            }
        });
    };

    w._admin = function (req, res, next) {
        if (!req.user.admin) {
            var err = new Error("Not found");
            err.status = 404;
            return next(err);
        }
        this.defaultLayout = "layouts/admin";
    };

    w.manage = function (req, res, next) {
        this._admin(req, res, next);
        var self = this,
            limit = req.query.limit || 10,
            page = req.query.page || 1,
            query = {},
            property = req.query.property || "",
            value = req.query.value;

        Utils.setObj(self.view, {
            platforms: [], page: page, count: 0,
            limit: limit, property: "", value: ""
        });
        if (property) query[property] = value;

        async.waterfall([
            function (callback) {
                Platform.find(query).limit(limit).skip(limit * (page - 1)).exec(callback);
            },
            function (platforms, callback) {
                self.view.platforms = platforms;

                Platform.count(query, callback);
            }
        ], function (err, count) {
            self.view.count = count;
            next();
        });
    };
    
    return w;
}());

module.exports = Website;
