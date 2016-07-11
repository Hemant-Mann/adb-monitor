var Shared = require('./controller');
var Platform = require('../models/platform');
var Utils = require('../scripts/util');
var Stat = require('../models/stat');
var Visitor = require('../models/visitor');
var Tracking = require('./tracking');
var pService = require('../services/platform');

/**
 * Platforms Controller
 */
var Platforms = (function () {
    'use strict';

    var controller = function Platforms() {}
    // inherit Methods|Properties
    controller.prototype = new Shared;
    controller.prototype.parent = Shared.prototype;

    var p = new controller();

    p.secure = ['index', 'stats', 'update', 'delete', 'create', 'getCode']; // Add Pages|Methods to this array which needs authentication
    p.defaultLayout = "layouts/client"; // change the layout

    /**
     * Overriding parent method
     * @param  {Object} req Express Request Object
     * @return {Boolean} True if authenticated
     */
    p._secure = function (req, res) {
        var basic = this.parent._secure.call(this, req); // call the parent method for basic authentication

        if (!basic) return false;
        return true;
    }

    /**
     * Default Index function showing all the platforms
     */
    p.index = function (req, res, cb) {
        var self = this;
        self.view.message = null;
        self.view.platforms = []; self.view.quickStats = {};

        pService.quickStats(req.user, function (err, platforms, data) {
            if (platforms.length === 0) {
                return res.redirect('/platforms/create.html');
            }
            self.view.platforms = platforms;
            self.view.quickStats = data;

            return cb(null);
        });
    };

    /**
     * This function will show the stats of the given platform
     */
    p.stats = function (req, res, cb) {
        var self = this,
            dateQuery = Utils.dateQuery(req.query),
            created = { $gte: dateQuery.start, $lte: dateQuery.end },
            device = req.query.device || '';

        self.view.device = device;

        self.view.platform = req.platform;
        self.view.today = Utils.today;

        Tracking.display(req.platform._id, created, device, function (result) {
            self.view.stats = result.stats;
            self.view.total = result.total;

            cb(null);
        });
    };

    /**
     * Updates the given platform
     */
    p.update = function (req, res, cb) {
        var self = this;
        self._jsonView();

        var platform = req.platform;
        var live = req.body.live,
            whitelist = req.body.whitelist;

        if (live) {
            live = Number(live);
            platform.live = live;
        } else if (whitelist) {
            whitelist = Number(whitelist);
            platform.whitelist = whitelist;
        }
        
        platform.save();
        cb(Utils.commonMsg(200, "Platform updated"));
    };

    /**
     * Can only Delete the code for domain if not stats have been saved for the given code
     */
    p.delete = function (req, res, cb) {
        this._jsonView();

        var c = req.platform;
        Stat.find({ pid: c._id }, '_id', function (err, stats) {
            if (err) return cb(Utils.commonMsg(500));

            if (stats.length > 0) {
                return cb({message: "You can't delete it try disabling the platform monitoring"});
            }

            c.remove(function (err) {
                if (err) return cb(Utils.commonMsg(500));

                return cb(Utils.commonMsg(200, 'Platform was removed'));
            });
        });
    };

    /**
     * Creates the platform from the request body
     */
    p.create = function (req, res, cb) {
        this.view.message = null;

        if (req.method === 'POST') {
            var platform = new Platform(req.body);
            platform.uid = req.user._id;
            platform.live = true;

            Platform.findOne({ uid: platform.uid, domain: Platform.parseDomain(platform.domain) }, '_id', function (err, c) {
                if (err) return cb(Utils.commonMsg(500));

                if (c) return cb({ message: "Platform already exists!!" });
                platform.save(function (err, p) {
                    if (err) return cb(Utils.commonMsg(500));

                    cb(Utils.commonMsg(200, 'Platform added'));
                });
            });
        } else {
            cb(null);
        }
    };

    p.getCode = function (req, res, cb) {
        this._jsonView();

        var _id = req.query.id;
        if (!_id) {
            return cb(Utils.commonMsg(400));
        }

        this.view.code = '<script type="text/javascript">(function(){window.__adbMonID="'+ _id +'";function l(u){var e=document.createElement("script");e.type="text/javascript";e.src ="//monitoradblock.com/js/"+u;e.async=true;var x= document.getElementsByTagName("script")[0];x.parentNode.insertBefore(e, x);}l("adbmon.min.js");})();</script>';
        cb(null);
    };

    /**
     * This function will the find the platform ("code") for the given _id and will attach it
     * to the request object acting as a middleware for the all the routes with param :id
     */
    p._find = function (req, res, next) {
        pService.find(req, res, next);
    };

    p.api = function (req, res, next) {
        this._noview();
        pService.api(req, res, next);
    };

    p.__class = controller.name.toLowerCase();
    return p;
}());

module.exports = Platforms;
