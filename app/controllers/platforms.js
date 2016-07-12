var Shared = require('./controller');
var Platform = require('../models/platform');
var Utils = require('../scripts/util');
var Stat = require('../models/stat');
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

    p.secure = ['update', 'delete', 'getCode']; // Add Pages|Methods to this array which needs authentication
    p.defaultLayout = "layouts/client"; // change the layout

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
