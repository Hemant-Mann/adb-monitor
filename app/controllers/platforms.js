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
    
    var a = new controller();

    a.secure = ['index', 'update', 'delete', 'create']; // Add Pages|Methods to this array which needs authentication
    a.defaultLayout = "layouts/client";
    a.index = function (req, res, cb) {
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

    a.show = function (req, res, cb) {
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
    a.delete = function (req, res, cb) {
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

    a.create = function (req, res, cb) {
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



    a.__class = controller.name.toLowerCase();
    return a;
}());

module.exports = Platforms;