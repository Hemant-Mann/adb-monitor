var Shared = require('./controller');
var display = require('./tracking').display;
var User = require('../models/user');
var Platform = require('../models/platform');

var Utils = require('../scripts/util');
var pService = require('../services/platform');

/**
 * Website Controller
 */
var Website = (function () {
    'use strict';

    var w = Utils.inherit(Shared, 'Website');

    w.secure = ['stats', 'add']; // Add Pages|Methods to this array which needs authentication
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

    w._find = function (req, res, next) {
        Platform.findOne({ _id: Utils.parseParam(req.params.id) }, function (err, p) {
            if (err) return next(Utils.commonMsg(400));

            req.platform = p;
            next();
        });
    };
    
    return w;
}());

module.exports = Website;
