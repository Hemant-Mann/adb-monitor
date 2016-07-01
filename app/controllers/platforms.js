var Shared = require('./controller');
var Code = require('../models/code');
var Utils = require('../scripts/util');
var Stat = require('../models/stat');

/**
 * Platforms Controller
 */
var Platforms = (function () {
    'use strict';

    var controller = function Platforms() {}

    // inherit Methods|Properties
    controller.prototype = new Shared;
    
    var p = new controller();

    p.secure = ['index', 'update', 'delete', 'create']; // Add Pages|Methods to this array which needs authentication
    p.defaultLayout = "layouts/client";
    p.index = function (req, res, cb) {
        var self = this;
        self.view.user = req.user;
        self.view.message = null;
        self.view.platforms = [];

        Code.find({}, function (err, codes) {
            if (err) {
                return cb(Utils.commonMsg(500));
            }

            if (codes.length === 0) {
                return cb({ message: "No Platforms found!! <a href='/platforms/create'>Add Now</a>" });
            }

            self.view.platforms = codes;
            cb(null);
        });
    };

    p.show = function (req, res, cb) {
        var self = this;
        self.view.platform = {};
        Code.findOne({ _id: Utils.parseParam(req.params.id) }, function (err, code) {
            console.log(err);
            if (err) {
                return cb(Utils.commonMsg(500));
            }

            if (!code) {
                self.view.platform = {};
                return cb(Utils.commonMsg(400));
            }

            self.view.platform = code;
            cb(null);
        });
    };
    /**
     * Can only Delete the code for domain if not stats have been saved for the given code
     */
    p.delete = function (req, res, cb) {
        this._jsonView();
        Code.findOne({ _id: Utils.parseParam(req.params.id) }, function (err, c) {
            if (err) {
                return cb(Utils.commonMsg(500));
            }

            if (!c) {
                return cb(Utils.commonMsg(400));
            }

            Stat.find({ code_id: c._id }, function (err, stats) {
                if (err) {
                    return cb(Utils.commonMsg(500));
                }

                if (stats.length > 0) {
                    return cb({message: "You can't delete it try disabling the platform monitoring"});
                }

                c.remove(function (err) {
                    if (err) {
                        return cb(Utils.commonMsg(500));
                    }

                    return cb(Utils.commonMsg(200, 'Platform was removed '));
                });
            });
        });
    };

    p.create = function (req, res, cb) {
        this.view.message = null;

        if (req.method === 'POST') {
            var platform = new Code(req.body);
            platform.user_id = req.user._id;
            platform.live = true;

            platform.save(function (err, p) {
                if (err) {
                    return cb(Utils.commonMsg(500));
                }

                if (p) {
                    return cb(Utils.commonMsg(200, 'Platform added '));
                }
            })
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

        var code = '<script type="text/javascript">(function() {window.__adbMonID = "'+ _id +'";function l(u) {var e = document.createElement("script");e.type = "text/javascript";e.src = "//localhost:3000/js/" + u;e.async = true;var x = document.getElementsByTagName("script")[0];x.parentNode.insertBefore(e, x);}l("adbmon.js");})();</script>';
        this.view.code = code;
        cb(null);

    };

    p.__class = controller.name.toLowerCase();
    return p;
}());

module.exports = Platforms;