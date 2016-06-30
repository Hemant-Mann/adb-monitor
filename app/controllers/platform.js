var Shared = require('./controller');
var Code = require('../models/code');
var Utils = require('../scripts/util');

/**
 * Platform Controller
 */
var Platform = (function () {
    'use strict';

    var controller = function Platform() {}

    // inherit Methods|Properties
    controller.prototype = new Shared;
    
    var a = new controller();

    a.secure = ['index', 'manage']; // Add Pages|Methods to this array which needs authentication
    a.defaultLayout = "layouts/client";
    a.index = function (req, res, cb) {
        this.view.user = req.user;
        cb(null);   // pass control to the calling function
    };

    a.show = function (req, res, cb) {
        var self = this;
        Code.findOne({_id: Utils.parseParam(req.params.id) }, function (err, code) {
            console.log(err);
            if (err) {
                return cb(Utils.commonMsg(500));
            }

            if (!code) {
                res.redirect('/404');
            }

            self.view.platform = code;
            cb(null);
        })
    };

    a.update = function (req, res, cb) {
        
    };

    a.delete = function (req, res, cb) {
        
    };

    a.create = function (req, res, cb) {
        this.view.message = null;
        if (req.method === 'POST') {
            var platform = new Code(req.body);
            platform.user_id = req.user._id;

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

module.exports = Platform;